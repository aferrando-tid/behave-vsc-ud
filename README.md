# Behave VSC 

## Pre-release v0.3.0

- This is a pre-release. On each update you should check the [Release notes](https://github.com/jimasp/behave-vsc/releases) for breaking changes.
- A test runner (and debugger) for Python behave tests in vscode
- Built with the native Visual Studio Code Test API  
- Tested on Linux and Windows
- See [Troubleshooting](#troubleshooting) below if you have any problems

### Release notes
- See [here](https://github.com/jimasp/behave-vsc/releases)

---
## Features
- Debug or Run behave tests from the test side bar, or from inside a feature file.
- Supports nested folders, such that you can run a nested folder on it's own.
- Supports multiroot workspaces, including running tests from all workspaces in parallel.
- Run customisation via extension settings (e.g. `runParallel`, `featuresPath`, `envVarList`, etc.)
- Go to step definition from feature file. (Not shown in the below gif. Right-click inside a feature file on a line containing a step and click "Go to Step Definition"). You can also map a keybinding for this command if you wish (e.g. F12).

![Behave VSC demo gif](https://github.com/jimasp/behave-vsc/raw/main/images/behave-vsc.gif)


---
## Project requirements
- Extension activation requires at least one `*.feature` file somewhere in a workspace.
- No conflicting behave extension is enabled
- A compatible directory structure (see below)
- [ms-python.python](https://marketplace.visualstudio.com/items?itemName=ms-python.python) extension
- [behave](https://behave.readthedocs.io)
- [python](https://www.python.org/) 

### Required project directory structure
- A single `features` (lowercase by default) folder somewhere, which contains a `steps` folder. (You don't have to call it "features" - read on, but behave requires you have a "steps" folder.)
- A behave-conformant directory structure, for example:
```  
  . features/  
  .       +-- environment.py
  .       +-- steps/  
  .       |      +-- *.py  
  .       +-- web_tests/  
  .       |      +-- *.feature  
  .       +-- storage_tests/  
  .       |      +-- *.feature  
```
- If your features folder is not called "features", or is not in the workspace root, then you can add a `behave.ini` or `.behaverc` file to your workspace folder and add a `paths` setting and then update the `featuresPath` setting in extension settings. Example:
```
// behave.ini file
[behave]
paths=behave_tests/features 

// settings.json file
"behave-vsc.featuresPath": "behave_tests/features",
```
- If you are using a multi-root workspace with multiple projects that contain feature files, then see note below in [Extension settings](#extension-settings)
- While behave only supports one "steps" folder, you can import steps from other folders via python (you should test this manually with behave first):
```  
  . features/  
  .       +-- environment.py
  .       +-- steps/  
  .       |      +-- import_steps.py  (`from features.web_tests.steps import web_steps`)
  .       +-- web_tests/  
  .       |      +-- steps/
  .       |          +-- web_steps.py
  .       |      +-- *.feature  
  .       +-- storage_tests/  
  .       |      +-- *.feature  
```


---
## Extension settings
- This extension has various options to customise your test run via `settings.json`, e.g. `runParallel`, `featuresPath`, `envVarList`, etc.
- You can also disable/enable `justMyCode` for debug (via `settings.json` not `launch.json`).
- If you are using a multi-root workspace with multiple projects that contain feature files, you can set up any default settings in your `*.code-workspace` file, then optionally override these as required in the `settings.json` in each workspace folder. 
- For information on available options, go to the extension settings in vscode (e.g. click the cog next to Behave VSC in the extensions side bar and then choose "Extension Settings" from the context menu).

---  
## How it works

### How test runs work:

- The python path is obtained via the `ms-python.python` extension (exported settings) and is read before each run, so it is kept in sync with your project.

- When running all tests _and_ the "RunAllAsOne" extension setting is enabled (the default), it runs this command:  
`python -m behave`

- When running tests one at a time, the extension builds up a separate command for each test and runs it. For example:  
`python -m behave -i "features/myfeaturegroup/myfeature.feature" -n "^my scenario$"`

- For each run, the equivalent behave command to run the test manually appears in the Behave VSC output window. (The _actual_ command run includes `--junit` and `--junit-directory` parameters, but these are not displayed.)
- The extension then parses the junit file output and updates the test result.
- The behave output and any errors appear in the Behave VSC output window.
- How the run works is controlled by you via extension settings in your `settings.json` file (e.g. `runParallel` etc.)

### How debug works:
- It dynamically builds a debug launch config and runs that. (This enables the `ms-python.python` extension to do the work of debugging.)
- The extension then parses the junit file output and updates the test result.
- Whether debug steps into external code is controlled by the extension setting `behave-vsc.justMyCode` (i.e. in your `settings.json` *not* your `launch.json`).
- Error output is shown in the debug console window and/or Behave VSC window depending on the nature of the error.
- To reduce noise when debugging, the behave command and behave std output is not shown when in debug. Run the test instead if you want this output.



---
## Troubleshooting
This a pre-release undergoing active development. If you used a previous version of this extension, but you have issues with the latest version, then please read through the [release notes](#release-notes) for breaking changes. If that does not resolve your issue, then please rollback to the previous working version via the vscode uninstall dropdown and raise an [issue](https://github.com/jimasp/behave-vsc/issues). Otherwise:
- Does your project meet the [Project Requirements](#project-requirements) and have the [Required project directory structure](#required-project-directory-structure)?
- If you have set the `featuresPath` in extension settings, make sure it matches the paths setting in your behave configuration file.
- Have you tried _manually_ running the behave command that is logged in the Behave VSC output window?
- If you are getting different results running all tests vs running a test separately, it's probably down to lack of test isolation.
- Do you have the correct extension [settings](#extension-settings) for your project? (See [Q&A](#Q&A) for information on how to see your effective settings.)
- Do you have runParallel turned on? Try turning it off. 
- Do you have the latest version of the extension installed? The problem may have been fixed in a newer release. (Please note that the latest version you can install is determined by your vscode version, so you may need to update vscode first.)
- Try temporarily disabling other extensions. 
- Check if the problem is in [Known Issues](#known-issues-and-limitations)
 - Does your project match the [Tested with](#tested-with) environment tested for this release? (Older releases are available from from the uninstall dropdown in vscode, or in [github](https://github.com/jimasp/behave-vsc/releases) (github contains information on which software versions they were tested with).
- Check if the issue has already been reported in github [issues](https://github.com/jimasp/behave-vsc/issues). github [issues](https://github.com/jimasp/behave-vsc/issues). 
- The extension is only tested with a couple of example projects. It's quite possible that something specific to your project/setup/environment is not accounted for. See [Contributing](CONTRIBUTING.md) for instructions on debugging the extension with your own project. (Does the same issue occur with the example project workspaces, or just in your own project?) 
### Q&A
- How can I see all effective settings for the extension? On starting vscode, look in the Behave VSC output window.
- Why am I not seeing any exceptions while debugging? Do you have the appropriate breakpoint settings in vs code, e.g. do you have "Raised Exceptions" etc. turned off?
- How do I clear test results? This isn't that obvious in vscode atm. You have to click the ellipsis `...` at the top of the test side bar and then click "Clear all results".
- Where is the behave junit output stored? In a temp folder that is deleted (recycled) each time the extension is started. This is determined by your OS and temp path environment variables, in code (nodejs) the directory is `os.tmpDir()/behave-vsc`. (Note that if your test run uses runParallel, then multiple files are created for the same feature via a separate folder for each scenario. This is a workaround to stop the same file being written multiple times for the same feature, which in runParallel mode would stop us from being able to update the test because behave writes "skipped" (not "pending") by default for tests that are not yet complete.)
- When will this extension have a release version? When the code is stable. At the moment the code is subject to rewrites/refactoring.

---
## Known issues and limitations
- Not internationalised. There shouldn't be any date/time issues, but character sets are untested. (If this affects you, you may wish to raise a PR.)
- "Go to Step" context menu doesn't always work or match correctly and never will. This is because there are a lot of ways to specify step matching and parameters in behave - `parse`;`re`;`cfparse`, and we would have to recreate these matching algorithms exactly. 
- "Go to step" context menu will only find steps that are in `.py` files in a folder called `steps` that is in your features folder (e.g. if you import steps in python from a steps library folder external to your features folder it won't find them). 
- Test side bar refresh button may be duplicated if more than one test extension is active, (this isn't really an issue as such, you may actually prefer it. MS have a [fix](https://github.com/microsoft/vscode/issues/139737), but it requires _other_ test extensions authors to update their code (this extension has applied the fix).
- Parallel test runs add up durations, making the test run look like it took longer than it actually did. Debug test runs also currently have invalid times.
- Running debug against multiple test targets at once starts a fresh debug session for each test (because a separate behave process is run for each test). This can cause some knock-on minor UI side effects like having to click debug stop button multiple times. If you are running multiple debug targets at once and you want to stop them, you can use the test run stop button instead, or use a keyboard shortcut for debug stop and hit that a couple of times, the default is Shift+F5.

---
## Contributing

If you would like to submit a pull request, please see the [contributing](CONTRIBUTING.md) doc.

