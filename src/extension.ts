/* eslint-disable @typescript-eslint/ban-ts-comment */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: '"vscode"' has no exported member 'StatementCoverage'
import * as vscode from 'vscode';
import config, { Configuration, EXTENSION_FULL_NAME, EXTENSION_NAME } from "./Configuration";
import { BehaveTestData, Scenario, TestData, TestFile } from './TestFile';
import {
  getUrisOfWkspFoldersWithFeatures, getWorkspaceSettingsForFile, isFeatureFile,
  isStepsFile, logExtensionVersion, removeDirectoryRecursive, WkspError
} from './common';
import { StepMap } from './stepsParser';
import { gotoStepHandler } from './gotoStepHandler';
import { getStepMap, FileParser } from './FileParser';
import { cancelTestRun, disposeCancelTestRunSource, testRunHandler } from './testRunHandler';
import { TestWorkspaceConfigWithWkspUri } from './test/workspace-suite-shared/testWorkspaceConfig';


const testData = new WeakMap<vscode.TestItem, BehaveTestData>();
export interface QueueItem { test: vscode.TestItem; scenario: Scenario; }


export type TestSupport = {
  runHandler: (debug: boolean, request: vscode.TestRunRequest, cancellation: vscode.CancellationToken) => Promise<QueueItem[] | undefined>,
  config: Configuration,
  ctrl: vscode.TestController,
  parser: FileParser,
  getSteps: () => StepMap,
  testData: TestData,
  configurationChangedHandler: (event?: vscode.ConfigurationChangeEvent, testCfg?: TestWorkspaceConfigWithWkspUri) => Promise<void>
};


export function deactivate() {
  disposeCancelTestRunSource();
}


// called on extension activation or the first time a new/unrecognised workspace gets added.
// call anything that needs to be initialised, and set up all relevant event handlers/hooks/subscriptions with vscode api
export async function activate(context: vscode.ExtensionContext): Promise<TestSupport | undefined> {

  try {

    console.log("activate called, node pid:" + process.pid);
    config.logger.syncChannelsToWorkspaceFolders();
    logExtensionVersion(context);
    const parser = new FileParser();

    const ctrl = vscode.tests.createTestController(`${EXTENSION_FULL_NAME}.TestController`, 'Feature Tests');
    // any function contained in subscriptions.push() will execute immediately, 
    // as well as registering it for disposal on extension deactivation
    // i.e. startWatchingWorkspace will execute immediately, as will registerCommand, but gotoStepHandler will not (as it is a parameter to
    // registerCommand, which is a disposable that ensures our custom command will no longer be active when the extension is deactivated).
    // to test any custom dispose() methods (which must be synchronous), just start and then close the extension host environment.
    context.subscriptions.push(ctrl);
    context.subscriptions.push(vscode.Disposable.from(config));
    for (const wkspUri of getUrisOfWkspFoldersWithFeatures()) {
      context.subscriptions.push(startWatchingWorkspace(wkspUri, ctrl, parser));
    }
    context.subscriptions.push(vscode.commands.registerCommand("behave-vsc.gotoStep", gotoStepHandler));

    // TODO - rename cancelRemoveDirectoryRecursive token and function to reflect that they remove the temp folder
    const cancelRemoveDirectoryRecursive = new vscode.CancellationTokenSource();
    removeDirectoryRecursive(config.extTempFilesUri, cancelRemoveDirectoryRecursive.token);
    const runHandler = testRunHandler(testData, ctrl, parser, cancelRemoveDirectoryRecursive);

    ctrl.createRunProfile('Run Tests', vscode.TestRunProfileKind.Run,
      async (request: vscode.TestRunRequest, token: vscode.CancellationToken) => {
        await runHandler(false, request, token);
      }
      , true);

    ctrl.createRunProfile('Debug Tests', vscode.TestRunProfileKind.Debug,
      async (request: vscode.TestRunRequest, token: vscode.CancellationToken) => {
        await runHandler(true, request, token);
      }
      , true);


    ctrl.resolveHandler = async (item: vscode.TestItem | undefined) => {
      try {
        if (!item)
          return;

        const data = testData.get(item);
        if (data instanceof TestFile) {
          const wkspSettings = getWorkspaceSettingsForFile(item.uri);
          await data.updateScenarioTestItemsFromFeatureFileOnDisk(wkspSettings, testData, ctrl, item, "resolveHandler");
        }
      }
      catch (e: unknown) {
        config.logger.logError(e);
      }
    };

    ctrl.refreshHandler = async (cancelToken: vscode.CancellationToken) => {
      try {
        await parser.clearTestItemsAndParseFilesForAllWorkspaces(testData, ctrl, "refreshHandler", cancelToken);
      }
      catch (e: unknown) {
        config.logger.logError(e);
      }
    };


    // onDidTerminateDebugSession doesn't provide reason for the stop,
    // so we need to check the reason from the debug adapter protocol
    context.subscriptions.push(vscode.debug.registerDebugAdapterTrackerFactory('*', {
      createDebugAdapterTracker() {
        let threadExit = false;

        return {
          onDidSendMessage: (m) => {
            try {
              // https://github.com/microsoft/vscode-debugadapter-node/blob/main/debugProtocol.json
              // console.log(JSON.stringify(m));

              if (m.body?.reason === "exited" && m.body?.threadId) {
                // mark threadExit for subsequent calls
                threadExit = true;
                return;
              }

              if (m.event === "exited") {
                if (!threadExit) {
                  // exit, but not a thread exit, so we need to set flag to 
                  // stop the run, (most likely debug was stopped by user)
                  cancelTestRun("onDidSendMessage (debug stop)");
                }
              }
            }
            catch (e: unknown) {
              config.logger.logError(e);
            }
          },
        };
      }
    }));

    context.subscriptions.push(vscode.workspace.onDidChangeWorkspaceFolders(async () => {
      try {
        // note - the first time a new/unrecognised workspace gets added a new node host 
        // process will start, this host process will terminate, and activate() will be called shortly after
        //
        // most of the work will happen in the onDidChangeConfiguration handler, here we just resync the logger
        config.logger.syncChannelsToWorkspaceFolders();
      }
      catch (e: unknown) {
        config.logger.logError(e);
      }
    }));


    // called when there is a settings.json/*.vscode-workspace change, or when workspace folders are added/removed
    // (also called directly by integation tests with a testCfg)
    const configurationChangedHandler = async (event?: vscode.ConfigurationChangeEvent, testCfg?: TestWorkspaceConfigWithWkspUri) => {

      // for integration test runAllTestsAndAssertTheResults, 
      // only reload config on request (i.e. when testCfg supplied)
      if (config.integrationTestRunAll && !testCfg)
        return;

      config.logger.logInfoAllWksps("Settings change detected");

      try {
        cancelTestRun("configurationChangedHandler");

        // note - affectsConfiguration(ext,uri) i.e. with a scope (uri) param is smart re. default resource values, but 
        // we don't want that behaviour because we want to distinguish between runAllAsOne being set and being absent from 
        // settings.json (via inspect not get), so we don't include the uri in the affectsConfiguration() call
        // (separately the change could be a global window setting)
        if (testCfg || (event && event.affectsConfiguration(EXTENSION_NAME))) {
          for (const wkspUri of getUrisOfWkspFoldersWithFeatures(true)) {
            if (!testCfg) {
              config.reloadSettings(wkspUri);
              continue;
            }
            if (testCfg.wkspUri === wkspUri)
              config.reloadSettings(wkspUri, testCfg.testConfig);
          }
        }

        // this function is automatically called after onDidChangeWorkspaceFolders if a workspace is added or removed,
        // so we need to reparse all test nodes to rebuild the top level test items after the configuration has been applied (above)
        // (in the case of a testConfig insertion we just reparse the supplied workspace to avoid issues with parallel workspace integration test runs)
        if (testCfg)
          parser.parseFilesForWorkspace(testCfg.wkspUri, testData, ctrl, "configurationChangedHandler");
        else
          parser.clearTestItemsAndParseFilesForAllWorkspaces(testData, ctrl, "configurationChangedHandler");
      }
      catch (e: unknown) {
        config.logger.logError(e);
      }
    }


    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(async (event) => {
      await configurationChangedHandler(event);
    }));


    const updateNodeForDocument = async (e: vscode.TextDocument) => {
      const wkspSettings = getWorkspaceSettingsForFile(e.uri);
      const item = await parser.getOrCreateFeatureTestItemAndParentFolderTestItemsFromFeatureFile(wkspSettings, testData, ctrl, e.uri, "updateNodeForDocument");
      if (item) {
        item.testFile.createScenarioTestItemsFromFeatureFileContents(wkspSettings, testData, e.uri.path,
          ctrl, e.getText(), item.testItem, "updateNodeForDocument");
      }
    }

    // for any open .feature documents on startup
    // TODO - review if we still need this?
    const docs = vscode.workspace.textDocuments.filter(d => d.uri.scheme === "file" && d.uri.path.toLowerCase().endsWith(".feature"));
    for (const doc of docs) {
      await updateNodeForDocument(doc);
    }

    return {
      // return instances to support integration testing
      runHandler: runHandler,
      config: config,
      ctrl: ctrl,
      parser: parser,
      getSteps: getStepMap,
      testData: testData,
      configurationChangedHandler: configurationChangedHandler
    };

  }
  catch (e: unknown) {
    if (config && config.logger) {
      config.logger.logError(e);
    }
    else {
      // no logger, use vscode.window message
      const text = (e instanceof Error ? (e.stack ? e.stack : e.message) : e as string);
      vscode.window.showErrorMessage(text);
    }
  }

} // end activate()



function startWatchingWorkspace(wkspUri: vscode.Uri, ctrl: vscode.TestController, parser: FileParser) {

  // NOTE - not just .feature and .py files, but also watch FOLDER changes inside the features folder
  const wkspSettings = config.getWorkspaceSettings(wkspUri);
  const wkspFullFeaturesPath = wkspSettings.featuresUri.path;
  const pattern = new vscode.RelativePattern(wkspFullFeaturesPath, "**");
  const watcher = vscode.workspace.createFileSystemWatcher(pattern);

  const updater = (uri: vscode.Uri) => {
    try {

      if (isStepsFile(uri)) {
        parser.updateStepsFromStepsFile(wkspFullFeaturesPath, uri, "updater");
        return;
      }

      if (isFeatureFile(uri)) {
        parser.updateTestItemFromFeatureFile(wkspSettings, testData, ctrl, uri, "updater");
      }

    }
    catch (e: unknown) {
      config.logger.logError(new WkspError(e, wkspUri));
    }
  }


  // fires on either new file/folder creation OR rename (inc. git actions)
  watcher.onDidCreate(uri => {
    updater(uri)
  });

  // fires on file save (inc. git actions)
  watcher.onDidChange(uri => {
    updater(uri)
  });

  // fires on either file/folder delete OR rename (inc. git actions)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  watcher.onDidDelete(uri => {

    const path = uri.path.toLowerCase();

    // we want folders in our pattern to be watched as e.g. renaming a folder does not raise events for child files    
    // but we cannot determine if this is a file or folder deletion as:
    //   (a) it has been deleted so we can't stat, and 
    //   (b) "." is valid in folder names so we can't determine by looking at the path
    // but we should ignore specific file extensions or paths we know we don't care about
    if (path.endsWith(".tmp")) // .tmp = vscode file history file
      return;

    // log for extension developers in case we need to add another file type above
    if (path.indexOf(".") && !isFeatureFile(uri) && !isStepsFile(uri)) {
      console.warn("detected deletion of unanticipated file type");
    }

    try {
      parser.parseFilesForWorkspace(wkspUri, testData, ctrl, "OnDidDelete");
    }
    catch (e: unknown) {
      config.logger.logError(new WkspError(e, wkspUri));
    }
  });


  parser.parseFilesForWorkspace(wkspUri, testData, ctrl, "startWatchingWorkspace");

  return watcher;
}
