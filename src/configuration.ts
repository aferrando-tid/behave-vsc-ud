import * as os from 'os';
import * as vscode from 'vscode';
import { getUrisOfWkspFoldersWithFeatures } from './common';
import { diagLog, Logger } from './logger';
import { WorkspaceSettings as WorkspaceSettings, WindowSettings } from './settings';

export interface Configuration {
  integrationTestRun: boolean;
  readonly extensionTempFilesUri: vscode.Uri;
  readonly logger: Logger;
  readonly workspaceSettings: { [wkspUriPath: string]: WorkspaceSettings };
  readonly globalSettings: WindowSettings;
  reloadSettings(wkspUri: vscode.Uri, testConfig?: vscode.WorkspaceConfiguration): void;
  getPythonExecutable(wksp: WorkspaceSettings): Promise<string>;
  dispose(): void;
}


// don't export this, use the interface
class ExtensionConfiguration implements Configuration {
  public integrationTestRun = false;
  public readonly extensionTempFilesUri;
  public readonly logger: Logger;
  private static _configuration?: ExtensionConfiguration;
  private _windowSettings: WindowSettings | undefined = undefined;
  private _resourceSettings: { [wkspUriPath: string]: WorkspaceSettings } = {};

  private constructor() {
    ExtensionConfiguration._configuration = this;
    this.logger = new Logger();
    this.extensionTempFilesUri = vscode.Uri.joinPath(vscode.Uri.file(os.tmpdir()), "behave-vsc-tid");
    diagLog("Configuration singleton constructed (this should only fire once)");
  }

  public dispose() {
    this.logger.dispose();
  }

  static get configuration() {
    if (ExtensionConfiguration._configuration)
      return ExtensionConfiguration._configuration;
    ExtensionConfiguration._configuration = new ExtensionConfiguration();
    return ExtensionConfiguration._configuration;
  }

  // called by onDidChangeConfiguration
  public reloadSettings(wkspUri: vscode.Uri, testConfig?: vscode.WorkspaceConfiguration) {
    if (testConfig) {
      this._windowSettings = new WindowSettings(testConfig);
      this._resourceSettings[wkspUri.path] = new WorkspaceSettings(wkspUri, testConfig, this._windowSettings, this.logger);
    }
    else {
      this._windowSettings = new WindowSettings(vscode.workspace.getConfiguration("behave-vsc-tid"));
      this._resourceSettings[wkspUri.path] = new WorkspaceSettings(wkspUri,
        vscode.workspace.getConfiguration("behave-vsc-tid", wkspUri), this._windowSettings, this.logger);
    }
  }

  public get globalSettings(): WindowSettings {
    return this._windowSettings
      ? this._windowSettings
      : this._windowSettings = new WindowSettings(vscode.workspace.getConfiguration("behave-vsc-tid"));
  }

  public get workspaceSettings(): { [wkspUriPath: string]: WorkspaceSettings } {
    const winSettings = this.globalSettings;
    getUrisOfWkspFoldersWithFeatures().forEach(wkspUri => {
      if (!this._resourceSettings[wkspUri.path]) {
        this._resourceSettings[wkspUri.path] =
          new WorkspaceSettings(wkspUri, vscode.workspace.getConfiguration("behave-vsc-tid", wkspUri), winSettings, this.logger);
      }
    });
    return this._resourceSettings;
  }

  // note - python interpreter can be changed dynamically by the user, so don't store the result
  getPythonExecutable = async (wksp: WorkspaceSettings) => {
    const msPyExt = "ms-python.python";
    const pyext = vscode.extensions.getExtension(msPyExt);

    if(wksp.pythonPath) {
      return wksp.pythonPath
    }

    if (!pyext)
      throw (`Behave VSC could not find required dependency ${msPyExt}`);

    if (!pyext.isActive) {
      await pyext?.activate();
      if (!pyext.isActive)
        throw (`Behave VSC could not activate required dependency ${msPyExt}`);
    }

    const pythonExec = await pyext?.exports.settings.getExecutionDetails(wksp.uri).execCommand[0];
    if (!pythonExec)
      throw (`Behave VSC failed to obtain python executable for ${wksp.name} workspace from ${msPyExt}`);

    return pythonExec;
  }

}

// global = stop the constructor getting called twice in extension integration tests
declare const global: any; // eslint-disable-line @typescript-eslint/no-explicit-any
if (!global.config)
  global.config = ExtensionConfiguration.configuration;
export const config: ExtensionConfiguration = global.config;
