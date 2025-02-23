/* eslint-disable @typescript-eslint/ban-ts-comment */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: '"vscode"' has no exported member 'StatementCoverage'
import * as vscode from 'vscode';
import { config, Configuration } from "./configuration";
import { BehaveTestData, Scenario, TestData, TestFile } from './parsers/testFile';
import {
  basename,
  getContentFromFilesystem,
  getUrisOfWkspFoldersWithFeatures, getWorkspaceSettingsForFile, isFeatureFile,
  isStepsFile, logExtensionVersion, removeExtensionTempDirectory, urisMatch
} from './common';
import { StepFileStep } from './parsers/stepsParser';
import { gotoStepHandler } from './handlers/gotoStepHandler';
import { findStepReferencesHandler, nextStepReferenceHandler as nextStepReferenceHandler, prevStepReferenceHandler, treeView } from './handlers/findStepReferencesHandler';
import { FileParser } from './parsers/fileParser';
import { cancelTestRun, disposeCancelTestRunSource, testRunHandler } from './runners/testRunHandler';
import { TestWorkspaceConfigWithWkspUri } from './_integrationTests/suite-shared/testWorkspaceConfig';
import { diagLog, DiagLogType } from './logger';
import { getDebugAdapterTrackerFactory } from './runners/behaveDebug';
import { performance } from 'perf_hooks';
import { StepMapping, getStepFileStepForFeatureFileStep, getStepMappingsForStepsFileFunction } from './parsers/stepMappings';
import { autoCompleteProvider } from './handlers/autoCompleteProvider';
import { formatFeatureProvider } from './handlers/formatFeatureProvider';
import { SemHighlightProvider, semLegend } from './handlers/semHighlightProvider';


const testData = new WeakMap<vscode.TestItem, BehaveTestData>();
const wkspWatchers = new Map<vscode.Uri, vscode.FileSystemWatcher>();
export const parser = new FileParser();
export interface QueueItem { test: vscode.TestItem; scenario: Scenario; }


export type TestSupport = {
  runHandler: (debug: boolean, request: vscode.TestRunRequest, testRunStopButtonToken: vscode.CancellationToken) => Promise<QueueItem[] | undefined>,
  config: Configuration,
  ctrl: vscode.TestController,
  parser: FileParser,
  getStepMappingsForStepsFileFunction: (stepsFileUri: vscode.Uri, lineNo: number) => StepMapping[],
  getStepFileStepForFeatureFileStep: (featureFileUri: vscode.Uri, line: number) => StepFileStep | undefined,
  testData: TestData,
  configurationChangedHandler: (event?: vscode.ConfigurationChangeEvent, testCfg?: TestWorkspaceConfigWithWkspUri, forceRefresh?: boolean) => Promise<void>
};


export function deactivate() {
  disposeCancelTestRunSource();
}


// called on extension activation or the first time a new/unrecognised workspace gets added.
// call anything that needs to be initialised, and set up all relevant event handlers/hooks/subscriptions with vscode api
export async function activate(context: vscode.ExtensionContext): Promise<TestSupport | undefined> {

  try {

    const start = performance.now();
    diagLog("activate called, node pid:" + process.pid);
    config.logger.syncChannelsToWorkspaceFolders();
    logExtensionVersion(context);
    const ctrl = vscode.tests.createTestController(`behave-vsc-tid.TestController`, 'Feature Tests');
    parser.clearTestItemsAndParseFilesForAllWorkspaces(testData, ctrl, "activate");

    // any function contained in subscriptions.push() will execute immediately,
    // as well as registering it for disposal on extension deactivation
    // i.e. startWatchingWorkspace will execute immediately, as will registerCommand, but gotoStepHandler will not (as it is a parameter to
    // registerCommand, which is a disposable that ensures our custom command will no longer be active when the extension is deactivated).
    // to test any custom dispose() methods (which must be synchronous), just start and then close the extension host environment.
    for (const wkspUri of getUrisOfWkspFoldersWithFeatures()) {
      const watcher = startWatchingWorkspace(wkspUri, ctrl, parser);
      wkspWatchers.set(wkspUri, watcher);
      context.subscriptions.push(watcher);
    }

    context.subscriptions.push(
      ctrl,
      treeView,
      config,
      vscode.commands.registerTextEditorCommand(`behave-vsc-tid.gotoStep`, gotoStepHandler),
      vscode.commands.registerTextEditorCommand(`behave-vsc-tid.findStepReferences`, findStepReferencesHandler),
      vscode.commands.registerCommand(`behave-vsc-tid.stepReferences.prev`, prevStepReferenceHandler),
      vscode.commands.registerCommand(`behave-vsc-tid.stepReferences.next`, nextStepReferenceHandler),
      vscode.languages.registerCompletionItemProvider('gherkin', autoCompleteProvider, ...[" "]),
      vscode.languages.registerDocumentRangeFormattingEditProvider('gherkin', formatFeatureProvider),
      vscode.languages.registerDocumentSemanticTokensProvider({ language: 'gherkin' }, new SemHighlightProvider(), semLegend)
    );

    const removeTempDirectoryCancelSource = new vscode.CancellationTokenSource();
    context.subscriptions.push(removeTempDirectoryCancelSource);
    removeExtensionTempDirectory(removeTempDirectoryCancelSource.token);
    const runHandler = testRunHandler(testData, ctrl, parser, removeTempDirectoryCancelSource);
    context.subscriptions.push(getDebugAdapterTrackerFactory());

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
      let wkspSettings;

      try {
        if (!item || !item.uri || item.uri?.scheme !== 'file')
          return;

        const data = testData.get(item);
        if (!(data instanceof TestFile))
          return;

        wkspSettings = getWorkspaceSettingsForFile(item.uri);
        const content = await getContentFromFilesystem(item.uri);
        await data.createScenarioTestItemsFromFeatureFileContent(wkspSettings, content, testData, ctrl, item, "resolveHandler");
      }
      catch (e: unknown) {
        // entry point function (handler) - show error
        const wkspUri = wkspSettings ? wkspSettings.uri : undefined;
        config.logger.showError(e, wkspUri);
      }
    };

    ctrl.refreshHandler = async (cancelToken: vscode.CancellationToken) => {
      try {
        await parser.clearTestItemsAndParseFilesForAllWorkspaces(testData, ctrl, "refreshHandler", cancelToken);
      }
      catch (e: unknown) {
        // entry point function (handler) - show error
        config.logger.showError(e, undefined);
      }
    };


    // called when a user renames, adds or removes a workspace folder.
    // NOTE: the first time a new not-previously recognised workspace gets added a new node host
    // process will start, this host process will terminate, and activate() will be called shortly after
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    context.subscriptions.push(vscode.workspace.onDidChangeWorkspaceFolders(async (event) => {
      try {
        await configurationChangedHandler(undefined, undefined, true);
      }
      catch (e: unknown) {
        // entry point function (handler) - show error
        config.logger.showError(e, undefined);
      }
    }));


    // called when a user edits a file.
    // we want to reparse on edit (not just on disk changes) because:
    // a. the user may run a file they just edited without saving,
    // b. the semantic highlighting while typing requires the stepmappings to be up to date as the user types,
    // c. instant test tree updates is a nice bonus for user experience
    // d. to keep stepmappings in sync in case user clicks go to step def/ref before file save
    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(async (event) => {
      try {
        const uri = event.document.uri;
        if (!isFeatureFile(uri) && !isStepsFile(uri))
          return;
        const wkspSettings = getWorkspaceSettingsForFile(uri);
        parser.reparseFile(uri, event.document.getText(), wkspSettings, testData, ctrl);
      }
      catch (e: unknown) {
        // entry point function (handler) - show error
        config.logger.showError(e, undefined);
      }
    }));


    // called by onDidChangeConfiguration when there is a settings.json/*.vscode-workspace change
    // and onDidChangeWorkspaceFolders (also called by integration tests with a testCfg).
    // NOTE: in some circumstances this function can be called twice in quick succession when a multi-root workspace folder is added/removed/renamed
    // (i.e. once by onDidChangeWorkspaceFolders and once by onDidChangeConfiguration), but parser methods will self-cancel as needed
    const configurationChangedHandler = async (event?: vscode.ConfigurationChangeEvent, testCfg?: TestWorkspaceConfigWithWkspUri,
      forceFullRefresh?: boolean) => {

      // for integration test runAllTestsAndAssertTheResults,
      // only reload config on request (i.e. when testCfg supplied)
      if (config.integrationTestRun && !testCfg)
        return;

      try {

        // note - affectsConfiguration(ext,uri) i.e. with a scope (uri) param is smart re. default resource values, but  we don't want
        // that behaviour because we want to distinguish between some properties (e.g. runAllAsOne) being set vs being absent from
        // settings.json (via inspect not get), so we don't include the uri in the affectsConfiguration() call
        // (separately, just note that the settings change could be a global window setting from *.code-workspace file)
        const affected = event && event.affectsConfiguration("behave-vsc-tid");
        if (!affected && !forceFullRefresh && !testCfg)
          return;

        if (!testCfg) {
          config.logger.clearAllWksps();
          cancelTestRun("configurationChangedHandler");
        }

        // changing featuresPath in settings.json/*.vscode-workspace to a valid path, or adding/removing/renaming workspaces
        // will not only change the set of workspaces we are watching, but also the output channels
        config.logger.syncChannelsToWorkspaceFolders();

        for (const wkspUri of getUrisOfWkspFoldersWithFeatures(true)) {
          if (testCfg) {
            if (urisMatch(testCfg.wkspUri, wkspUri)) {
              config.reloadSettings(wkspUri, testCfg.testConfig);
            }
            continue;
          }

          config.reloadSettings(wkspUri);
          const oldWatcher = wkspWatchers.get(wkspUri);
          if (oldWatcher)
            oldWatcher.dispose();
          const watcher = startWatchingWorkspace(wkspUri, ctrl, parser);
          wkspWatchers.set(wkspUri, watcher);
          context.subscriptions.push(watcher);
        }

        // configuration has now changed, e.g. featuresPath, so we need to reparse files

        // (in the case of a testConfig insertion we just reparse the supplied workspace to avoid issues with parallel workspace integration test runs)
        if (testCfg) {
          parser.parseFilesForWorkspace(testCfg.wkspUri, testData, ctrl, "configurationChangedHandler");
          return;
        }

        // we don't know which workspace was affected (see comment on affectsConfiguration above), so just reparse all workspaces
        // (also, when a workspace is added/removed/renamed (forceRefresh), we need to clear down and reparse all test nodes to rebuild the top level nodes)
        parser.clearTestItemsAndParseFilesForAllWorkspaces(testData, ctrl, "configurationChangedHandler");
      }
      catch (e: unknown) {
        // entry point function (handler) - show error
        config.logger.showError(e, undefined);
      }
    }


    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(async (event) => {
      await configurationChangedHandler(event);
    }));

    diagLog(`perf info: activate took  ${performance.now() - start} ms`);

    return {
      // return instances to support integration testing
      runHandler: runHandler,
      config: config,
      ctrl: ctrl,
      parser: parser,
      getStepMappingsForStepsFileFunction: getStepMappingsForStepsFileFunction,
      getStepFileStepForFeatureFileStep: getStepFileStepForFeatureFileStep,
      testData: testData,
      configurationChangedHandler: configurationChangedHandler
    };

  }
  catch (e: unknown) {
    // entry point function (handler) - show error
    if (config && config.logger) {
      config.logger.showError(e, undefined);
    }
    else {
      // no logger, use vscode.window.showErrorMessage directly
      const text = (e instanceof Error ? (e.stack ? e.stack : e.message) : e as string);
      vscode.window.showErrorMessage(text);
    }
  }

} // end activate()


function startWatchingWorkspace(wkspUri: vscode.Uri, ctrl: vscode.TestController, parser: FileParser) {

  // NOTE - not just .feature and .py files, but also watch FOLDER changes inside the features folder
  const wkspSettings = config.workspaceSettings[wkspUri.path];
  const pattern = new vscode.RelativePattern(wkspSettings.uri, `${wkspSettings.workspaceRelativeFeaturesPath}/**`);
  const watcher = vscode.workspace.createFileSystemWatcher(pattern);

  const updater = async (uri: vscode.Uri) => {
    if (uri.scheme !== "file")
      return;

    try {
      console.log(`updater: ${uri.fsPath}`);
      parser.reparseFile(uri, undefined, wkspSettings, testData, ctrl);
    }
    catch (e: unknown) {
      // entry point function (handler) - show error
      config.logger.showError(e, wkspUri);
    }
  }


  // fires on either new file/folder creation OR rename (inc. git actions)
  watcher.onDidCreate(uri => updater(uri));

  // fires on file save (inc. git actions)
  watcher.onDidChange(uri => updater(uri));

  // fires on either file/folder delete OR rename (inc. git actions)
  watcher.onDidDelete(uri => {
    if (uri.scheme !== "file")
      return;

    try {
      const path = uri.path.toLowerCase();

      // we want folders in our pattern to be watched as e.g. renaming a folder does not raise events for child
      // files, but we cannot determine if this is a file or folder deletion as:
      //   (a) it has been deleted so we can't stat it, and
      //   (b) "." is valid in folder names so we can't determine by looking at the path
      // but we can ignore specific file extensions or paths we know we don't care about
      if (path.endsWith(".tmp")) // .tmp = vscode file history file
        return;

      // log for extension developers in case we need to add another file type above
      if (basename(uri).includes(".") && !isFeatureFile(uri) && !isStepsFile(uri)) {
        diagLog(`detected deletion of unanticipated file type, uri: ${uri}`, wkspUri, DiagLogType.warn);
      }

      parser.parseFilesForWorkspace(wkspUri, testData, ctrl, "OnDidDelete");
    }
    catch (e: unknown) {
      // entry point function (handler) - show error
      config.logger.showError(e, wkspUri);
    }
  });

  return watcher;
}
