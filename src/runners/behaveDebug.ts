import * as vscode from 'vscode';
import { config } from "../configuration";
import { WorkspaceSettings } from "../settings";
import { parseAndUpdateTestResults } from '../parsers/junitParser';
import { QueueItem } from '../extension';
import { diagLog } from '../logger';
import { cancelTestRun } from './testRunHandler';
import { isBehaveExecutionError } from '../common';
import { performance } from 'perf_hooks';
let disconnected = false;

// debug tracker to set behaveExecutionError flag so we can terminate and
// mark tests failed for behave execution errors
let behaveExecutionError = false;
export function getDebugAdapterTrackerFactory() {
  return vscode.debug.registerDebugAdapterTrackerFactory('*', {

    // this function will get called for each debug session
    createDebugAdapterTracker() {
      disconnected = false;

      return {
        onDidSendMessage: (m) => {
          try {
            // https://github.com/microsoft/vscode-debugadapter-node/blob/main/debugProtocol.json

            // diagLog(JSON.stringify(m));

            if (m.command === "disconnect")
              disconnected = true;

            // most stderr is stuff like "SKIP", "HOOK-ERROR", or missing step definitions, which will be visible in the UI,
            // but if there's an execution error with a test, we won't get any junit output, so we set a flag which we handle in parseAndUpdateTestResults
            const stderr = m.body?.category === "stderr";
            if (stderr && isBehaveExecutionError(m.body.output)) {
              behaveExecutionError = true;
              cancelTestRun("onDidSendMessage (behave execution error)");
              return;
            }

          }
          catch (e: unknown) {
            cancelTestRun("onDidSendMessage (error)");
            // entry point function (handler) - show error
            config.logger.showError(e, undefined);
          }
        },
      };
    }
  })
}
export async function debugScenario(wkspSettings: WorkspaceSettings, run: vscode.TestRun, queueItem: QueueItem,
  args: string[], cancelToken: vscode.CancellationToken, friendlyCmd: string, junitFileUri: vscode.Uri): Promise<void> {

  // handle test run stop
  const cancellationHandler = cancelToken.onCancellationRequested(async () => {
    await vscode.debug.stopDebugging();
  });

  // detect debug stop click by user
  const customEventHandler = vscode.debug.onDidReceiveDebugSessionCustomEvent(async (event: vscode.DebugSessionCustomEvent) => {
    // determine by order of events (i.e. if this event is exited and it's disconnected)
    if (event.event === "exited" && disconnected) {
      diagLog("debug stopped by user");
      cancelTestRun("onDidReceiveDebugSessionCustomEvent");
    }
  });

  behaveExecutionError = false;

  try {
    diagLog(friendlyCmd, wkspSettings.uri); // log debug cmd for extension devs only

    // remove stdout noise when debugging
    args.push("--no-summary", "--outfile", vscode.Uri.joinPath(config.extensionTempFilesUri, "debug.log").fsPath);

    const env = { ...process.env, ...wkspSettings.envVarOverrides };

    const debugLaunchConfig = {
      name: `behave-vsc-tid-debug`,
      console: "internalConsole",
      type: "python",
      cwd: wkspSettings.uri.fsPath,
      request: 'launch',
      module: "behave",
      args: args,
      env: env,
      justMyCode: wkspSettings.justMyCode
    };

    const wkspFolder = vscode.workspace.getWorkspaceFolder(wkspSettings.uri);
    const start = performance.now();

    if (!await vscode.debug.startDebugging(wkspFolder, debugLaunchConfig)) {
      diagLog("unable to start debug session, was debug stop button clicked?", wkspSettings.uri);
      return;
    }
    return await new Promise((resolve, reject) => {
      // debug stopped or completed
      const terminateEvent = vscode.debug.onDidTerminateDebugSession(async () => {
        try {
          if (!cancelToken.isCancellationRequested) {
            // the test run will have been terminated, so we cannot update the test result
            const debugDuration = performance.now() - start;
            await parseAndUpdateTestResults(true, behaveExecutionError, wkspSettings, junitFileUri, run, queueItem, cancelToken, debugDuration);
          }
          resolve();
        }
        catch (e: unknown) {
          return reject(e);
        }
        finally {
          terminateEvent.dispose();
        }
      });
    });

  }
  finally {
    customEventHandler.dispose();
    cancellationHandler.dispose();
  }
}
