# Behave VSC

Debug and run Python [behave](https://behave.readthedocs.io/) BDD tests using the native Visual Studio Code Test API.
Includes two-way step navigation, Gherkin syntax highlighting, autoformatting, autocompletion, and a few basic snippets.

## Features

- Run or Debug behave tests, either from the test side bar or from inside a feature file.
- Select to run/debug all tests, a nested folder, or just a single feature or scenario.
- See failed test run result inside the feature file. (Full run results are available in the Behave VSC output window.)
- Extensive run customisation settings (e.g. `runParallel`, `featuresPath`, `envVarOverrides`, etc.)
- Two-way step navigation:
  - "Go to Step Definition" from inside a feature file (default Alt+F12).
  - "Find All Step References" from inside a step file (default Alt+F12).
  - Quick navigate in the Step References Window (default F4 + Shift F4).
- Smart feature step auto-completion, e.g. typing `And` after a `Given` step will only show `@given` or `@step` step suggestions. (Also some snippets are thrown in.)
- Feature file formatting (default Ctrl+K,Ctrl+F).
- Automatic Gherkin syntax highlighting (colourisation), including smart parameter recognition.
- This extension supports multi-root workspaces, so you can run features from more than one project in a single instance of vscode. (Each project folder must have its own distinct features/steps folders.)

![Behave VSC demo gif](https://github.com/aferrando-tid/behave-vsc-tid/raw/main/images/behave-vsc-tid.gif)

---

## Workspace requirements

- No conflicting behave/gherkin/cucumber extension is enabled
- Extension activation requires at least one `*.feature` file somewhere in the workspace
- A compatible directory structure (see below)
- [ms-python.python](https://marketplace.visualstudio.com/items?itemName=ms-python.python) extension
- [behave](https://behave.readthedocs.io)
- [python](https://www.python.org/)

### Required project directory structure

- A single `features` folder (lowercase by default), which contains a `steps` folder. You don't have to call it "features" - read on, but behave requires you have a folder called "steps". (Multiple features folders are allowed in a multi-root workspace, but only one per project.)
- A *behave-conformant* directory structure, for example:

```text
  . my-project
  .    +-- behave.ini
  .    +-- features/
  .       +-- environment.py
  .       +-- steps/
  .       |      +-- *.py
  .       +-- storage_tests/
  .       |      +-- *.feature
  .       +-- web_tests/
  .       |      +-- *.feature
  .       |      +-- steps/
  .       |         +-- *.py
```

- If your features folder is not called "features", or is not in your project root, then you can add a behave config file (e.g. `behave.ini` or `.behaverc`) to your project folder and add a `paths` setting and then update the `featuresPath` setting in extension settings to match. This is a relative path to your project folder. For example:

```text
# behave.ini
[behave]
paths=my_tests/behave_features

// settings.json
{
  "behave-vsc-tid.featuresPath": "my_tests/behave_features"
}
```

---

## Extension settings

- This extension has various options to customise your test run via `settings.json`, e.g. `runParallel`, `featuresPath`, `envVarOverrides`, etc.
- You can also disable/enable `justMyCode` for debug (via `settings.json` not `launch.json`).
- If you are using a multi-root workspace with multiple projects that contain feature files, you can set up default settings in your `*.code-workspace` file, then optionally override these as required in the `settings.json` in each workspace folder.
- For more information on available options, go to the extension settings in vscode.

---

## How it works

### How test runs work

- The python path is obtained via the `ms-python.python` extension (exported settings) and is read before each run, so it is kept in sync with your project.

- When running all tests *and* the "RunAllAsOne" extension setting is enabled (the default), it runs this command:
`python -m behave --show-skipped`

- When running tests one at a time, the extension builds up a separate command for each test and runs it. For example:
`python -m behave --show-skipped -i "features/myfeaturegroup/myfeature.feature" -n "^my scenario$"`

- For each run, the *equivalent* behave command to run the test manually appears in the Behave VSC output window. (The *actual* command run includes `--junit` and `--junit-directory` parameters, but these are not displayed.)
- The behave process is spawned, and behave output is written to the Behave VSC output window for the associated workspace.
- The extension parses the junit file output and updates the test result in the UI, and any assertion failures and python exceptions are shown in the test run detail accessible in the feature file.
- You can adjust the run behaviour via extension settings in your `settings.json` file (e.g. `runParallel` etc.)

### How debug works

- It dynamically builds a debug launch config with the behave command and runs that. (This is a programmatic equivalent to creating your own debug launch.json and enables the `ms-python.python` extension to do the work of debugging.)
- You can control whether debug steps into external code via the extension setting `behave-vsc-tid.justMyCode` (i.e. in your `settings.json` *not* your `launch.json`).
- Behave error output (only) is shown in the debug console window. (This is to reduce noise when debugging. Run the test instead if you want to see the full behave output.)
- The extension parses the junit file output and updates the test result in the UI, and any assertion failures and python exceptions are shown in the test run detail accessible in the feature file.

---

## Q&A

- *How can I see all effective settings for the extension?* On starting vscode, look in the Behave VSC output window.
- *How can I see the active behave configuration being used for behave execution?* In your behave config file, set `verbose=true`.
- *How do I clear previous test results?* This isn't that obvious in vscode. Click the ellipsis `...` at the top of the test side bar and then click "Clear all results".
- *Why does the behave command output contain `--show-skipped`?* This flag must be enabled for junit files (which the extension depends on) to be produced for skipped tests. It is enabled by default, so this override is there *just in case* your `behave.ini`/`.behaverc` file specifies `show_skipped=False`.
- *How can I only execute specific tags while using the extension?* There are a lot of options here, but there are four examples below. The first two options will not avoid the overhead associated with starting a behave process for each test, i.e. the first two will only be notably faster when either (a) you have `runAllAsOne` enabled (the default) and you run are running all tests in the workspace at once, or (b) you are skipping slow tests.

  - (slow, simple, inflexible) use the `default_tags=` setting in your behave.ini file (or a `[behave.userdata]` setting for a custom setup)
  - (slow, highly flexible) use the `envVarOverrides` extension setting to set an environment variable that is only set when running from the extension. This adds endless possibilities, but the most obvious approaches are probably: (a) setting the `BEHAVE_STAGE` environment variable, (b) to control a behave `active_tag_value_provider`, (c) to control `scenario.skip()`, or (d) to control a behave `before_all` for a completely custom setup.
  - (fast, simple) use the `fastSkipTags` extension setting. (i.e. applying the inverse - do *not* run these tags.)
  - (fast, flexible) if you regularly execute a subset of tests, consider if you can group them into folders, not just by tag, then you can select to run just that folder from the test tree in the UI instead.
- *How do I disable feature file snippets?* You can do this via a standard vscode setting: `"[gherkin]": { "editor.suggest.showSnippets": false }`
- *How do I disable autocomplete for feature file steps?* You can do this via a standard vscode setting: `"[gherkin]": { "editor.suggest.showFunctions": false }`
- *How do I enable automatic feature file formatting on save?* You can do this via a standard vscode setting: `"[gherkin]": { "editor.formatOnSave": true }`
- *Why can't I see print statements in the Behave VSC output window even though I have `stdout_capture=False` in my behave config file?* Because the extension depends on the `--junit` behave argument. As per the behave docs, with this flag set, all stdout and stderr will be redirected and dumped to the junit report, regardless of the capture/no-capture options. If you want to see print statements, copy/paste the outputted command and run it manually (or run `python -m behave` for all test output).
- *Where is the behave junit output stored?* In a temp folder that is deleted (recycled) each time the extension is started. The path is displayed on startup in the Behave VSC output window. (Note that if your test run uses runParallel, then multiple files are created for the same feature via a separate folder for each scenario. This is a workaround to stop the same junit file being written multiple times for the same feature, which in runParallel mode would stop us from being able to know the result of the test, because each parallel behave execution would rewrite the file and mark scenarios not included in that execution as "skipped".)
- *When will this extension have a release version?* When the code is more stable. At the moment the code is subject to rewrites/refactoring which makes bugs more likely.

---

## Troubleshooting

### If you have used a previous version of this extension

- Please read through the [release notes](https://github.com/aferrando-tid/behave-vsc-tid/releases) for breaking changes. If that does not resolve your issue, then please rollback to the previous working version via the vscode uninstall dropdown and raise an [issue](https://github.com/aferrando-tid/behave-vsc-tid/issues).

### Otherwise

- Does your project meet the [workspace requirements](#workspace-requirements) and have the [required project directory structure](#required-project-directory-structure)?
- If you have set the `featuresPath` in extension settings, make sure it matches the `paths` setting in your behave configuration file.
- Did you set extension settings in your user settings instead of your workspace settings?
- Have you tried *manually* running the behave command that is logged in the Behave VSC output window?
- If you are getting different results running all tests vs running a test separately, then it is probably due to lack of test isolation.
- If you are not seeing exceptions while debugging a test, do you have the appropriate breakpoint settings in vscode, e.g. do you have "Raised Exceptions" etc. turned off?
- Do you have the correct extension [settings](#extension-settings) for your project? (See [Q&A](#Q&A) for information on how to see your effective settings.)
- Does restarting vscode solve your issue?
- Do you have runParallel turned on? Try turning it off.
- Do you have the latest version of the extension installed? The problem may have been fixed in a newer release. (Please note that the latest version you can install is determined by your vscode version, so you may need to update vscode first.)
- Check if the problem is in [Known Issues](#known-issues-and-limitations) below
- Check if the issue has already been reported in github [issues](https://github.com/aferrando-tid/behave-vsc-tid/issues?q=is%3Aissue).
- Try temporarily disabling other extensions.
- Does your environment match the one tested for this release? You can check the environment tested for each release in [github](https://github.com/aferrando-tid/behave-vsc-tid/releases) and downgrade as required.
- Any extension errors should pop up in a notification window, but you can also look at debug logs and error stacks by enabling `xRay` in the extension settings and using vscode command "Developer: Toggle Developer Tools".
- The extension is only tested with a few example projects. It's possible that something specific to your project/setup/environment is not accounted for. See [Contributing](CONTRIBUTING.md) for instructions on debugging the extension with your own project. (If you debug with your own project, you may also wish to check whether the same issue occurs with one of the example project workspaces.)

---

## Known issues and limitations

- There is currently a [bug](https://github.com/microsoft/vscode/issues/149328) in vscode itself when you hit the "Run Tests" button (or equivalent command) and multiple test extensions are enabled, this causes: (a) skipped tests not to update (they are shown as "not yet run"), and (b) the test run not to end/update results in a multi-root project when there are multiple test extensions active. A workaround is simply not to use the "Run Tests" button, i.e. run tests from a test tree node instead (e.g. "Feature Tests")
- There is currently a [bug](https://github.com/microsoft/vscode-extension-samples/issues/728) in vscode itself where a test will no longer play from within the editor window when you add spaces or autoformat a feature file. A workaround is to close the feature file and reopen it.
- vscode always adds up test durations. For parallel runs this means the parent test node reports a longer time than the test run actually took.
- Step navigation limitations ("Go to Step Definition" and "Find All Step References"):
  - Step matching does not always match as per behave. It uses a simple regex match via replacing `{foo}` -> `{.*}`. As such, it does *not* consider typed parameters like `{foo:d}`, or `cfparse` cardinal parameters like `{foo:?}` or `re` regex matching like `(?P<foo>foo)`.
  - Step navigation only finds steps that are in `.py` files in a folder called `steps` that is in your features folder (e.g. if you import steps in python from a steps library folder outside your steps folder it won't find them).

---

## Contributing

If you would like to submit a pull request, please see the  [contributing](CONTRIBUTING.md) doc.
