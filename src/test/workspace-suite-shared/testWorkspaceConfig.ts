import * as vscode from 'vscode';


export class TestWorkspaceConfig implements vscode.WorkspaceConfiguration {

	private alwaysShowOutput: boolean | undefined;
	private envVarList: string | undefined;
	private fastSkipList: string | undefined;
	private featuresPath: string | undefined;
	private justMyCode: boolean | undefined;
	private runAllAsOne: boolean | undefined;
	private runParallel: boolean | undefined;
	private runWorkspacesInParallel: boolean | undefined;
	private showConfigurationWarnings: boolean | undefined;

	// all user-settable settings in settings.json
	constructor({
		alwaysShowOutput, envVarList, fastSkipList, wkspRelativeFeaturesPath: wkspRelativeFeaturesPath, justMyCode,
		runAllAsOne, runParallel, runWorkspacesInParallel, showConfigurationWarnings
	}: {
		alwaysShowOutput: boolean | undefined,
		envVarList: string | undefined,
		fastSkipList: string | undefined,
		wkspRelativeFeaturesPath: string | undefined,
		justMyCode: boolean | undefined,
		runAllAsOne: boolean | undefined,
		runParallel: boolean | undefined,
		runWorkspacesInParallel: boolean | undefined,
		showConfigurationWarnings: boolean | undefined
	}) {
		this.alwaysShowOutput = alwaysShowOutput;
		this.envVarList = envVarList;
		this.fastSkipList = fastSkipList;
		this.featuresPath = wkspRelativeFeaturesPath;
		this.justMyCode = justMyCode;
		this.runAllAsOne = runAllAsOne;
		this.runParallel = runParallel;
		this.runWorkspacesInParallel = runWorkspacesInParallel;
		this.showConfigurationWarnings = showConfigurationWarnings;
	}


	inspect<T>(section: string): {
		key: string; defaultValue?: T | undefined; globalValue?: T | undefined; workspaceValue?: T | undefined;
		workspaceFolderValue?: T | undefined; defaultLanguageValue?: T | undefined; globalLanguageValue?: T | undefined;
		workspaceLanguageValue?: T | undefined; workspaceFolderLanguageValue?: T | undefined;
		languageIds?: string[] | undefined;
	} | undefined {

		// switch for all user-settable settings in settings.json or *.code-workspace
		let response;
		switch (section) {
			case "alwaysShowOutput":
				response = <T><unknown>this.alwaysShowOutput;
				break;
			case "envVarList":
				response = <T><unknown>this.envVarList;
				break;
			case "fastSkipList":
				response = <T><unknown>this.fastSkipList;
				break;
			case "justMyCode":
				response = <T><unknown>this.justMyCode;
				break;
			case "featuresPath":
				response = <T><unknown>this.featuresPath;
				break;
			case "runAllAsOne":
				response = <T><unknown>this.runAllAsOne;
				break;
			case "runParallel":
				response = <T><unknown>this.runParallel;
				break;
			case "runWorkspacesInParallel":
				response = <T><unknown>this.runWorkspacesInParallel;
				break;
			case "showConfigurationWarnings":
				response = <T><unknown>this.showConfigurationWarnings;
				break;
			default:
				// eslint-disable-next-line no-debugger
				debugger;
				throw new Error("inspect() missing case for section: " + section);
		}

		return {
			key: "",
			workspaceFolderValue: response,
			workspaceLanguageValue: undefined,
			languageIds: []
		}
	}


	get<T>(section: string): T {

		// switch for all user-settable settings in settings.json or *.code-workspace
		//		
		// for get, vscode will use the default in the package.json if there is 
		// one, or otherwise a default value for the type (e.g. bool = false, string = "", etc.)
		// so we must mirror that behavior here and return defaults
		switch (section) {
			case "alwaysShowOutput":
				return <T><unknown>(this.alwaysShowOutput === undefined ? false : this.alwaysShowOutput);
			case "envVarList":
				return <T><unknown>(this.envVarList === undefined ? "" : this.envVarList);
			case "fastSkipList":
				return <T><unknown>(this.fastSkipList === undefined ? "" : this.fastSkipList);
			case "featuresPath":
				return <T><unknown>(this.featuresPath === undefined ? "features" : this.featuresPath);
			case "justMyCode":
				return <T><unknown>(this.justMyCode === undefined ? true : this.justMyCode);
			case "runAllAsOne":
				return <T><unknown>(this.runAllAsOne === undefined ? true : this.runAllAsOne);
			case "runParallel":
				return <T><unknown>(this.runParallel === undefined ? false : this.runParallel);
			case "runWorkspacesInParallel":
				return <T><unknown>(this.runWorkspacesInParallel === undefined ? true : this.runWorkspacesInParallel);
			case "showConfigurationWarnings":
				return <T><unknown>(this.showConfigurationWarnings === undefined ? true : this.showConfigurationWarnings);
			default:
				// eslint-disable-next-line no-debugger
				debugger;
				throw new Error("get() missing case for section: " + section);
		}
	}


	getExpected<T>(section: string, wkspUri?: vscode.Uri): T | undefined {


		const getExpectedEnvVarList = (): { [name: string]: string } | undefined => {
			switch (this.envVarList) {
				case "  'some_var' : 'double qu\"oted',  'some_var2':  'single qu\\'oted', 'empty_var'  :'', 'space_var': ' '  ":
					return { some_var: 'double qu"oted', some_var2: 'single qu\'oted', empty_var: '', space_var: ' ' };
				case "'some_var':'double qu\"oted','some_var2':'single qu\\'oted', 'empty_var':'', 'space_var': ' '":
					return { some_var: 'double qu"oted', some_var2: 'single qu\'oted', empty_var: '', space_var: ' ' };
				case "":
				case undefined:
					return {};
				default:
					// eslint-disable-next-line no-debugger
					debugger;
					throw new Error("getExpectedEnvVarList() missing case for envVarList: " + this.envVarList);
			}

		}

		const getExpectedFastSkipList = (): string[] => {
			switch (this.fastSkipList) {
				case "  @fast-skip-me,  @fast-skip-me-too, ":
					return ["@fast-skip-me", "@fast-skip-me-too"];
				case "@fast-skip-me,@fast-skip-me-too":
					return ["@fast-skip-me", "@fast-skip-me-too"];
				case "":
				case undefined:
					return [];
				default:
					// eslint-disable-next-line no-debugger
					debugger;
					throw new Error("getExpectedFastSkipList() missing case for fastSkipList: " + this.envVarList);
			}
		}

		const getExpectedFeaturesPath = (): string => {
			switch (this.featuresPath) {
				case "":
				case undefined:
					return "features";
				default:
					return this.featuresPath.trim().replace(/^\\|^\//, "").replace(/\\$|\/$/, "");
			}
		}

		const getExpectedFullFeaturesPath = (): string => {
			if (!wkspUri)
				throw "you must supply wkspUri to get the expected fullFeaturesPath";
			return vscode.Uri.joinPath(wkspUri, getExpectedFeaturesPath()).path;
		}

		const getExpectedFullFeaturesFsPath = (): string => {
			if (!wkspUri)
				throw "you must supply wkspUri to get the expected fullFeaturesPath";
			return vscode.Uri.joinPath(wkspUri, getExpectedFeaturesPath()).fsPath;
		}


		const getExpectedRunAllAsOne = (): boolean => {
			if (this.runParallel && this.runAllAsOne === undefined)
				return this.runAllAsOne = false;
			else
				return this.runAllAsOne = this.runAllAsOne === undefined ? true : this.runAllAsOne;
		};

		// switch for ALL (i.e. including non-user-settable) settings in settings.json or *.code-workspace 
		switch (section) {
			case "alwaysShowOutput":
				return <T><unknown>(this.get("alwaysShowOutput"));
			case "envVarList":
				return <T><unknown>getExpectedEnvVarList();
			case "fastSkipList":
				return <T><unknown>getExpectedFastSkipList();
			case "featuresPath":
				return <T><unknown>getExpectedFeaturesPath();
			case "featuresUri.path":
				return <T><unknown>getExpectedFullFeaturesPath();
			case "featuresUri.fsPath":
				return <T><unknown>getExpectedFullFeaturesFsPath();
			case "justMyCode":
				return <T><unknown>(this.get("justMyCode"));
			case "runAllAsOne":
				return <T><unknown>(getExpectedRunAllAsOne());
			case "runParallel":
				return <T><unknown>(this.get("runParallel"));
			case "runWorkspacesInParallel":
				return <T><unknown>(this.get("runWorkspacesInParallel"));
			case "showConfigurationWarnings":
				return <T><unknown>(this.get("showConfigurationWarnings"));

			default:
				// eslint-disable-next-line no-debugger
				debugger;
				throw new Error("getExpected() missing case for section: " + section);
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	has(section: string): boolean {
		throw new Error('has() function not implemented.');
	}



	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	update(section: string, value: never, configurationTarget?: boolean | vscode.ConfigurationTarget | null,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		overrideInLanguage?: boolean): Thenable<void> {
		throw new Error('update() function not implemented.');
	}

}
