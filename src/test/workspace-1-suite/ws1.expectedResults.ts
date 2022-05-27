import * as vscode from 'vscode';
import { Configuration } from "../../Configuration";
import { ParseCounts } from '../../FileParser';
import { TestResult, applyTestConfiguration } from "../workspace-suite-shared/expectedResults.helpers";


export function getWs1ExpectedCounts(debug: boolean, wkspUri: vscode.Uri, config: Configuration): ParseCounts {
  const testCount = getWs1ExpectedResults(debug, wkspUri, config).length;
  return { tests: { nodeCount: 51, testCount: testCount }, featureFileCountExcludingEmptyOrCommentedOut: 16, stepFiles: 3, stepMappings: 15 };
}

export function getWs1ExpectedResults(debug: boolean, wkspUri: vscode.Uri, config: Configuration): TestResult[] {

  const expectedResults: TestResult[] = [
    new TestResult({
      scenario_fastSkipTag: false,
      scenario_featureName: 'Basic',
      scenario_featureFileRelativePath: '{{featurePath}}/group1_features/basic.feature',
      scenario_getLabel: 'run a successful test',
      scenario_isOutline: false,
      scenario_result: 'passed',
      scenario_scenarioName: 'run a successful test',
      test_children: undefined,
      test_description: undefined,
      test_error: undefined,
      test_id: '.../example-project-1/{{featurePath}}/group1_features/basic.feature/run a successful test',
      test_label: 'run a successful test',
      test_parent: '.../example-project-1/{{featurePath}}/group1_features/basic.feature',
      test_uri: '.../example-project-1/{{featurePath}}/group1_features/basic.feature'
    }),
    new TestResult({
      scenario_fastSkipTag: false,
      scenario_featureName: 'Basic',
      scenario_featureFileRelativePath: '{{featurePath}}/group1_features/basic.feature',
      scenario_getLabel: 'run a slow test for async testing',
      scenario_isOutline: false,
      scenario_result: 'passed',
      scenario_scenarioName: 'run a slow test for async testing',
      test_children: undefined,
      test_description: undefined,
      test_error: undefined,
      test_id: '.../example-project-1/{{featurePath}}/group1_features/basic.feature/run a slow test for async testing',
      test_label: 'run a slow test for async testing',
      test_parent: '.../example-project-1/{{featurePath}}/group1_features/basic.feature',
      test_uri: '.../example-project-1/{{featurePath}}/group1_features/basic.feature'
    }),
    new TestResult({
      scenario_fastSkipTag: false,
      scenario_featureName: 'Basic',
      scenario_featureFileRelativePath: '{{featurePath}}/group1_features/basic.feature',
      scenario_getLabel: 'run another slow test for async testing',
      scenario_isOutline: false,
      scenario_result: 'passed',
      scenario_scenarioName: 'run another slow test for async testing',
      test_children: undefined,
      test_description: undefined,
      test_error: undefined,
      test_id: '.../example-project-1/{{featurePath}}/group1_features/basic.feature/run another slow test for async testing',
      test_label: 'run another slow test for async testing',
      test_parent: '.../example-project-1/{{featurePath}}/group1_features/basic.feature',
      test_uri: '.../example-project-1/{{featurePath}}/group1_features/basic.feature'
    }),
    new TestResult({
      scenario_fastSkipTag: false,
      scenario_featureName: 'Basic',
      scenario_featureFileRelativePath: '{{featurePath}}/group1_features/basic.feature',
      scenario_getLabel: 'run a failing test',
      scenario_isOutline: false,
      scenario_result: 'Failing step: When we implement a failing test ... failed\nTraceback (most recent call last):\n  File -snip- assert successful_or_failing == "successful"\nAssertionError',
      scenario_scenarioName: 'run a failing test',
      test_children: undefined,
      test_description: undefined,
      test_error: undefined,
      test_id: '.../example-project-1/{{featurePath}}/group1_features/basic.feature/run a failing test',
      test_label: 'run a failing test',
      test_parent: '.../example-project-1/{{featurePath}}/group1_features/basic.feature',
      test_uri: '.../example-project-1/{{featurePath}}/group1_features/basic.feature'
    }),
    new TestResult({
      scenario_fastSkipTag: false,
      scenario_featureName: 'Basic',
      scenario_featureFileRelativePath: '{{featurePath}}/group1_features/basic.feature',
      scenario_getLabel: 'run another successful test',
      scenario_isOutline: false,
      scenario_result: 'passed',
      scenario_scenarioName: 'run another successful test',
      test_children: undefined,
      test_description: undefined,
      test_error: undefined,
      test_id: '.../example-project-1/{{featurePath}}/group1_features/basic.feature/run another successful test',
      test_label: 'run another successful test',
      test_parent: '.../example-project-1/{{featurePath}}/group1_features/basic.feature',
      test_uri: '.../example-project-1/{{featurePath}}/group1_features/basic.feature'
    }),
    new TestResult({
      scenario_fastSkipTag: false,
      scenario_featureName: 'Basic',
      scenario_featureFileRelativePath: '{{featurePath}}/group1_features/basic.feature',
      scenario_getLabel: 'run a test with a missing steps',
      scenario_isOutline: false,
      scenario_result: "Failing step: When we have a missing step ... undefined",
      scenario_scenarioName: 'run a test with a missing steps',
      test_children: undefined,
      test_description: undefined,
      test_error: undefined,
      test_id: '.../example-project-1/{{featurePath}}/group1_features/basic.feature/run a test with a missing steps',
      test_label: 'run a test with a missing steps',
      test_parent: '.../example-project-1/{{featurePath}}/group1_features/basic.feature',
      test_uri: '.../example-project-1/{{featurePath}}/group1_features/basic.feature'
    }),
    new TestResult({
      scenario_fastSkipTag: false,
      scenario_featureName: 'Basic',
      scenario_featureFileRelativePath: '{{featurePath}}/group1_features/basic.feature',
      scenario_getLabel: 'run a skipped test',
      scenario_isOutline: false,
      scenario_result: 'skipped',
      scenario_scenarioName: 'run a skipped test',
      test_children: undefined,
      test_description: undefined,
      test_error: undefined,
      test_id: '.../example-project-1/{{featurePath}}/group1_features/basic.feature/run a skipped test',
      test_label: 'run a skipped test',
      test_parent: '.../example-project-1/{{featurePath}}/group1_features/basic.feature',
      test_uri: '.../example-project-1/{{featurePath}}/group1_features/basic.feature'
    }),

    new TestResult({
      scenario_fastSkipTag: false,
      scenario_featureFileRelativePath: 'behave tests/some tests/group1_features/basic.feature',
      scenario_featureName: 'Basic',
      scenario_getLabel: 'succeed with a long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long name',
      scenario_isOutline: false,
      scenario_result: 'passed',
      scenario_scenarioName: 'succeed with a long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long name',
      test_children: undefined,
      test_description: undefined,
      test_error: undefined,
      test_id: '.../example-project-1/behave tests/some tests/group1_features/basic.feature/succeed with a long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long name',
      test_label: 'succeed with a long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long name',
      test_parent: '.../example-project-1/behave tests/some tests/group1_features/basic.feature',
      test_uri: '.../example-project-1/behave tests/some tests/group1_features/basic.feature'
    }),

    new TestResult({
      scenario_fastSkipTag: true,
      scenario_featureName: 'fast skip feature',
      scenario_featureFileRelativePath: '{{featurePath}}/group2_features/fastskip_feature.feature',
      scenario_getLabel: 'fast skip by feature',
      scenario_isOutline: false,
      scenario_result: 'passed',
      scenario_scenarioName: 'fast skip by feature',
      test_children: undefined,
      test_description: undefined,
      test_error: undefined,
      test_id: '.../example-project-1/{{featurePath}}/group2_features/fastskip_feature.feature/fast skip by feature',
      test_label: 'fast skip by feature',
      test_parent: '.../example-project-1/{{featurePath}}/group2_features/fastskip_feature.feature',
      test_uri: '.../example-project-1/{{featurePath}}/group2_features/fastskip_feature.feature'
    }),
    new TestResult({
      scenario_fastSkipTag: false,
      scenario_featureName: 'skipped feature',
      scenario_featureFileRelativePath: '{{featurePath}}/group2_features/skipped.feature',
      scenario_getLabel: 'normal skip',
      scenario_isOutline: false,
      scenario_result: 'skipped',
      scenario_scenarioName: 'normal skip',
      test_children: undefined,
      test_description: undefined,
      test_error: undefined,
      test_id: '.../example-project-1/{{featurePath}}/group2_features/skipped.feature/normal skip',
      test_label: 'normal skip',
      test_parent: '.../example-project-1/{{featurePath}}/group2_features/skipped.feature',
      test_uri: '.../example-project-1/{{featurePath}}/group2_features/skipped.feature'
    }),
    new TestResult({
      scenario_fastSkipTag: false,
      scenario_featureName: 'Containing /[.*+?^${}()|[\\]\\ regex chars',
      scenario_featureFileRelativePath: '{{featurePath}}/group2_features/contains_regexchars.feature',
      scenario_getLabel: 'run a successful scenario containing a characters test /[.*+?^${}()|[\\]\\',
      scenario_isOutline: false,
      scenario_result: 'passed',
      scenario_scenarioName: 'run a successful scenario containing a characters test /[.*+?^${}()|[\\]\\',
      test_children: undefined,
      test_description: undefined,
      test_error: undefined,
      test_id: '.../example-project-1/{{featurePath}}/group2_features/contains_regexchars.feature/run a successful scenario containing a characters test /[.*+?^${}()|[\\]\\',
      test_label: 'run a successful scenario containing a characters test /[.*+?^${}()|[\\]\\',
      test_parent: '.../example-project-1/{{featurePath}}/group2_features/contains_regexchars.feature',
      test_uri: '.../example-project-1/{{featurePath}}/group2_features/contains_regexchars.feature'
    }),
    new TestResult({
      scenario_fastSkipTag: false,
      scenario_featureName: 'Mixed skip scenarios',
      scenario_featureFileRelativePath: '{{featurePath}}/group2_features/mixed_skip.feature',
      scenario_getLabel: 'normal skip',
      scenario_isOutline: false,
      scenario_result: 'skipped',
      scenario_scenarioName: 'normal skip',
      test_children: undefined,
      test_description: undefined,
      test_error: undefined,
      test_id: '.../example-project-1/{{featurePath}}/group2_features/mixed_skip.feature/normal skip',
      test_label: 'normal skip',
      test_parent: '.../example-project-1/{{featurePath}}/group2_features/mixed_skip.feature',
      test_uri: '.../example-project-1/{{featurePath}}/group2_features/mixed_skip.feature'
    }),
    new TestResult({
      scenario_fastSkipTag: false,
      scenario_featureName: 'Mixed skip scenarios',
      scenario_featureFileRelativePath: '{{featurePath}}/group2_features/mixed_skip.feature',
      scenario_getLabel: "don't skip and success",
      scenario_isOutline: false,
      scenario_result: 'passed',
      scenario_scenarioName: "don't skip and success",
      test_children: undefined,
      test_description: undefined,
      test_error: undefined,
      test_id: ".../example-project-1/{{featurePath}}/group2_features/mixed_skip.feature/don't skip and success",
      test_label: "don't skip and success",
      test_parent: '.../example-project-1/{{featurePath}}/group2_features/mixed_skip.feature',
      test_uri: '.../example-project-1/{{featurePath}}/group2_features/mixed_skip.feature'
    }),
    new TestResult({
      scenario_fastSkipTag: true,
      scenario_featureName: 'Mixed skip scenarios',
      scenario_featureFileRelativePath: '{{featurePath}}/group2_features/mixed_skip.feature',
      scenario_getLabel: 'fast skip a successful test',
      scenario_isOutline: false,
      scenario_result: 'passed',
      scenario_scenarioName: 'fast skip a successful test',
      test_children: undefined,
      test_description: undefined,
      test_error: undefined,
      test_id: '.../example-project-1/{{featurePath}}/group2_features/mixed_skip.feature/fast skip a successful test',
      test_label: 'fast skip a successful test',
      test_parent: '.../example-project-1/{{featurePath}}/group2_features/mixed_skip.feature',
      test_uri: '.../example-project-1/{{featurePath}}/group2_features/mixed_skip.feature'
    }),
    new TestResult({
      scenario_fastSkipTag: false,
      scenario_featureName: 'Mixed skip scenarios',
      scenario_featureFileRelativePath: '{{featurePath}}/group2_features/mixed_skip.feature',
      scenario_getLabel: "don't skip and fail",
      scenario_isOutline: false,
      scenario_result: 'Failing step: When we implement a failing test ... failed\nTraceback (most recent call last):\n  File -snip- assert successful_or_failing == "successful"\nAssertionError',
      scenario_scenarioName: "don't skip and fail",
      test_children: undefined,
      test_description: undefined,
      test_error: undefined,
      test_id: ".../example-project-1/{{featurePath}}/group2_features/mixed_skip.feature/don't skip and fail",
      test_label: "don't skip and fail",
      test_parent: '.../example-project-1/{{featurePath}}/group2_features/mixed_skip.feature',
      test_uri: '.../example-project-1/{{featurePath}}/group2_features/mixed_skip.feature'
    }),
    new TestResult({
      scenario_fastSkipTag: true,
      scenario_featureName: 'Mixed skip scenarios',
      scenario_featureFileRelativePath: '{{featurePath}}/group2_features/mixed_skip.feature',
      scenario_getLabel: 'fast skip a failing test',
      scenario_isOutline: false,
      scenario_result: 'Failing step: When we implement a failing test ... failed\nTraceback (most recent call last):\n  File -snip- assert successful_or_failing == "successful"\nAssertionError',
      scenario_scenarioName: 'fast skip a failing test',
      test_children: undefined,
      test_description: undefined,
      test_error: undefined,
      test_id: '.../example-project-1/{{featurePath}}/group2_features/mixed_skip.feature/fast skip a failing test',
      test_label: 'fast skip a failing test',
      test_parent: '.../example-project-1/{{featurePath}}/group2_features/mixed_skip.feature',
      test_uri: '.../example-project-1/{{featurePath}}/group2_features/mixed_skip.feature'
    }),
    new TestResult({
      scenario_fastSkipTag: false,
      scenario_featureName: 'Duplicate',
      scenario_featureFileRelativePath: '{{featurePath}}/group2_features/duplicate.feature',
      scenario_getLabel: 'run a test',
      scenario_isOutline: false,
      scenario_result: 'Failing step: When we implement a failing test ... failed\nTraceback (most recent call last):\n  File -snip- assert successful_or_failing == "successful"\nAssertionError',
      scenario_scenarioName: 'run a test',
      test_children: undefined,
      test_description: undefined,
      test_error: undefined,
      test_id: '.../example-project-1/{{featurePath}}/group2_features/duplicate.feature/run a test',
      test_label: 'run a test',
      test_parent: '.../example-project-1/{{featurePath}}/group2_features/duplicate.feature',
      test_uri: '.../example-project-1/{{featurePath}}/group2_features/duplicate.feature'
    }),
    new TestResult({
      scenario_fastSkipTag: false,
      scenario_featureName: 'Table feature',
      scenario_featureFileRelativePath: '{{featurePath}}/group1_features/table.feature',
      scenario_getLabel: 'Use a table (success)',
      scenario_isOutline: false,
      scenario_result: 'passed',
      scenario_scenarioName: 'Use a table (success)',
      test_children: undefined,
      test_description: undefined,
      test_error: undefined,
      test_id: '.../example-project-1/{{featurePath}}/group1_features/table.feature/Use a table (success)',
      test_label: 'Use a table (success)',
      test_parent: '.../example-project-1/{{featurePath}}/group1_features/table.feature',
      test_uri: '.../example-project-1/{{featurePath}}/group1_features/table.feature'
    }),
    new TestResult({
      scenario_fastSkipTag: false,
      scenario_featureName: 'Table feature',
      scenario_featureFileRelativePath: '{{featurePath}}/group1_features/table.feature',
      scenario_getLabel: 'Use a table (fail)',
      scenario_isOutline: false,
      scenario_result: 'Failing step: Then we will find 25 people in "Testers" ... failed\nTraceback (most recent call last):\n  File -snip- assert int(count) == sum(1 for ud in context.userDepts if ud.dept == dept)\nAssertionError',
      scenario_scenarioName: 'Use a table (fail)',
      test_children: undefined,
      test_description: undefined,
      test_error: undefined,
      test_id: '.../example-project-1/{{featurePath}}/group1_features/table.feature/Use a table (fail)',
      test_label: 'Use a table (fail)',
      test_parent: '.../example-project-1/{{featurePath}}/group1_features/table.feature',
      test_uri: '.../example-project-1/{{featurePath}}/group1_features/table.feature'
    }),
    new TestResult({
      scenario_fastSkipTag: false,
      scenario_featureName: 'Text block',
      scenario_featureFileRelativePath: '{{featurePath}}/group1_features/textblock.feature',
      scenario_getLabel: 'run a successful textblock test',
      scenario_isOutline: false,
      scenario_result: 'passed',
      scenario_scenarioName: 'run a successful textblock test',
      test_children: undefined,
      test_description: undefined,
      test_error: undefined,
      test_id: '.../example-project-1/{{featurePath}}/group1_features/textblock.feature/run a successful textblock test',
      test_label: 'run a successful textblock test',
      test_parent: '.../example-project-1/{{featurePath}}/group1_features/textblock.feature',
      test_uri: '.../example-project-1/{{featurePath}}/group1_features/textblock.feature'
    }),
    new TestResult({
      scenario_fastSkipTag: false,
      scenario_featureName: 'Text block',
      scenario_featureFileRelativePath: '{{featurePath}}/group1_features/textblock.feature',
      scenario_getLabel: 'run a failing textblock test',
      scenario_isOutline: false,
      scenario_result: 'Failing step: When we implement a failing test ... failed\nTraceback (most recent call last):\n  File -snip- assert successful_or_failing == "successful"\nAssertionError',
      scenario_scenarioName: 'run a failing textblock test',
      test_children: undefined,
      test_description: undefined,
      test_error: undefined,
      test_id: '.../example-project-1/{{featurePath}}/group1_features/textblock.feature/run a failing textblock test',
      test_label: 'run a failing textblock test',
      test_parent: '.../example-project-1/{{featurePath}}/group1_features/textblock.feature',
      test_uri: '.../example-project-1/{{featurePath}}/group1_features/textblock.feature'
    }),
    new TestResult({
      scenario_fastSkipTag: false,
      scenario_featureName: 'Mixed outline',
      scenario_featureFileRelativePath: '{{featurePath}}/group1_features/outline_mixed.feature',
      scenario_getLabel: 'Blenders Success',
      scenario_isOutline: true,
      scenario_result: 'passed',
      scenario_scenarioName: 'Blenders Success',
      test_children: undefined,
      test_description: undefined,
      test_error: undefined,
      test_id: '.../example-project-1/{{featurePath}}/group1_features/outline_mixed.feature/Blenders Success',
      test_label: 'Blenders Success',
      test_parent: '.../example-project-1/{{featurePath}}/group1_features/outline_mixed.feature',
      test_uri: '.../example-project-1/{{featurePath}}/group1_features/outline_mixed.feature'
    }),
    new TestResult({
      scenario_fastSkipTag: false,
      scenario_featureName: 'Mixed outline',
      scenario_featureFileRelativePath: '{{featurePath}}/group1_features/outline_mixed.feature',
      scenario_getLabel: 'Blenders Fail',
      scenario_isOutline: true,
      scenario_result: 'Failing step: Then it should transform into "FAIL" ... failed\nTraceback (most recent call last):\n  File -snip- assert context.blender.result == other_thing\nAssertionError',
      scenario_scenarioName: 'Blenders Fail',
      test_children: undefined,
      test_description: undefined,
      test_error: undefined,
      test_id: '.../example-project-1/{{featurePath}}/group1_features/outline_mixed.feature/Blenders Fail',
      test_label: 'Blenders Fail',
      test_parent: '.../example-project-1/{{featurePath}}/group1_features/outline_mixed.feature',
      test_uri: '.../example-project-1/{{featurePath}}/group1_features/outline_mixed.feature'
    }),
    new TestResult({
      scenario_fastSkipTag: false,
      scenario_featureName: 'Mixed outline',
      scenario_featureFileRelativePath: '{{featurePath}}/group1_features/outline_mixed.feature',
      scenario_getLabel: 'Blenders Skip',
      scenario_isOutline: true,
      scenario_result: 'skipped',
      scenario_scenarioName: 'Blenders Skip',
      test_children: undefined,
      test_description: undefined,
      test_error: undefined,
      test_id: '.../example-project-1/{{featurePath}}/group1_features/outline_mixed.feature/Blenders Skip',
      test_label: 'Blenders Skip',
      test_parent: '.../example-project-1/{{featurePath}}/group1_features/outline_mixed.feature',
      test_uri: '.../example-project-1/{{featurePath}}/group1_features/outline_mixed.feature'
    }),
    new TestResult({
      scenario_fastSkipTag: false,
      scenario_featureName: 'Mixed outline',
      scenario_featureFileRelativePath: '{{featurePath}}/group1_features/outline_mixed.feature',
      scenario_getLabel: 'Blenders Fail 2',
      scenario_isOutline: true,
      scenario_result: 'Failing step: Then it should transform into "FAIL" ... failed\nTraceback (most recent call last):\n  File -snip- assert context.blender.result == other_thing\nAssertionError',
      scenario_scenarioName: 'Blenders Fail 2',
      test_children: undefined,
      test_description: undefined,
      test_error: undefined,
      test_id: '.../example-project-1/{{featurePath}}/group1_features/outline_mixed.feature/Blenders Fail 2',
      test_label: 'Blenders Fail 2',
      test_parent: '.../example-project-1/{{featurePath}}/group1_features/outline_mixed.feature',
      test_uri: '.../example-project-1/{{featurePath}}/group1_features/outline_mixed.feature'
    }),
    new TestResult({
      scenario_fastSkipTag: true,
      scenario_featureName: 'Mixed outline',
      scenario_featureFileRelativePath: '{{featurePath}}/group1_features/outline_mixed.feature',
      scenario_getLabel: 'Blenders Fast Skip a Success',
      scenario_isOutline: true,
      scenario_result: 'passed',
      scenario_scenarioName: 'Blenders Fast Skip a Success',
      test_children: undefined,
      test_description: undefined,
      test_error: undefined,
      test_id: '.../example-project-1/{{featurePath}}/group1_features/outline_mixed.feature/Blenders Fast Skip a Success',
      test_label: 'Blenders Fast Skip a Success',
      test_parent: '.../example-project-1/{{featurePath}}/group1_features/outline_mixed.feature',
      test_uri: '.../example-project-1/{{featurePath}}/group1_features/outline_mixed.feature'
    }),
    new TestResult({
      scenario_fastSkipTag: false,
      scenario_featureName: 'Mixed outline',
      scenario_featureFileRelativePath: '{{featurePath}}/group1_features/outline_mixed.feature',
      scenario_getLabel: 'Blenders Success 2',
      scenario_isOutline: true,
      scenario_result: 'passed',
      scenario_scenarioName: 'Blenders Success 2',
      test_children: undefined,
      test_description: undefined,
      test_error: undefined,
      test_id: '.../example-project-1/{{featurePath}}/group1_features/outline_mixed.feature/Blenders Success 2',
      test_label: 'Blenders Success 2',
      test_parent: '.../example-project-1/{{featurePath}}/group1_features/outline_mixed.feature',
      test_uri: '.../example-project-1/{{featurePath}}/group1_features/outline_mixed.feature'
    }),
    new TestResult({
      scenario_fastSkipTag: true,
      scenario_featureName: 'Mixed outline',
      scenario_featureFileRelativePath: '{{featurePath}}/group1_features/outline_mixed.feature',
      scenario_getLabel: 'Blenders Fast Skip a Failure',
      scenario_isOutline: true,
      scenario_result: 'Failing step: Then it should transform into "FAIL" ... failed\nTraceback (most recent call last):\n  File -snip- assert context.blender.result == other_thing\nAssertionError',
      scenario_scenarioName: 'Blenders Fast Skip a Failure',
      test_children: undefined,
      test_description: undefined,
      test_error: undefined,
      test_id: '.../example-project-1/{{featurePath}}/group1_features/outline_mixed.feature/Blenders Fast Skip a Failure',
      test_label: 'Blenders Fast Skip a Failure',
      test_parent: '.../example-project-1/{{featurePath}}/group1_features/outline_mixed.feature',
      test_uri: '.../example-project-1/{{featurePath}}/group1_features/outline_mixed.feature'
    }),
    new TestResult({
      scenario_fastSkipTag: false,
      scenario_featureName: 'Duplicate',
      scenario_featureFileRelativePath: '{{featurePath}}/group1_features/duplicate.feature',
      scenario_getLabel: 'run a test',
      scenario_isOutline: false,
      scenario_result: 'Failing step: When we implement a failing test ... failed\nTraceback (most recent call last):\n  File -snip- assert successful_or_failing == "successful"\nAssertionError',
      scenario_scenarioName: 'run a test',
      test_children: undefined,
      test_description: undefined,
      test_error: undefined,
      test_id: '.../example-project-1/{{featurePath}}/group1_features/duplicate.feature/run a test',
      test_label: 'run a test',
      test_parent: '.../example-project-1/{{featurePath}}/group1_features/duplicate.feature',
      test_uri: '.../example-project-1/{{featurePath}}/group1_features/duplicate.feature'
    }),
    new TestResult({
      scenario_fastSkipTag: false,
      scenario_featureName: 'Outline success',
      scenario_featureFileRelativePath: '{{featurePath}}/group1_features/outline_success.feature',
      scenario_getLabel: 'Blend Success',
      scenario_isOutline: true,
      scenario_result: 'passed',
      scenario_scenarioName: 'Blend Success',
      test_children: undefined,
      test_description: undefined,
      test_error: undefined,
      test_id: '.../example-project-1/{{featurePath}}/group1_features/outline_success.feature/Blend Success',
      test_label: 'Blend Success',
      test_parent: '.../example-project-1/{{featurePath}}/group1_features/outline_success.feature',
      test_uri: '.../example-project-1/{{featurePath}}/group1_features/outline_success.feature'
    }),
    new TestResult({
      scenario_fastSkipTag: false,
      scenario_featureName: 'Outline success',
      scenario_featureFileRelativePath: '{{featurePath}}/group1_features/outline_success.feature',
      scenario_getLabel: 'Blend Success 2',
      scenario_isOutline: true,
      scenario_result: 'passed',
      scenario_scenarioName: 'Blend Success 2',
      test_children: undefined,
      test_description: undefined,
      test_error: undefined,
      test_id: '.../example-project-1/{{featurePath}}/group1_features/outline_success.feature/Blend Success 2',
      test_label: 'Blend Success 2',
      test_parent: '.../example-project-1/{{featurePath}}/group1_features/outline_success.feature',
      test_uri: '.../example-project-1/{{featurePath}}/group1_features/outline_success.feature'
    }),
    new TestResult({
      scenario_fastSkipTag: false,
      scenario_featureFileRelativePath: '{{featurePath}}/duplicate.feature',
      scenario_featureName: 'Duplicate',
      scenario_getLabel: 'run a test',
      scenario_isOutline: false,
      scenario_result: 'passed',
      scenario_scenarioName: 'run a test',
      test_children: undefined,
      test_description: undefined,
      test_error: undefined,
      test_id: '.../example-project-1/{{featurePath}}/duplicate.feature/run a test',
      test_label: 'run a test',
      test_parent: '.../example-project-1/{{featurePath}}/duplicate.feature',
      test_uri: '.../example-project-1/{{featurePath}}/duplicate.feature',
    }),

    new TestResult({
      scenario_fastSkipTag: false,
      scenario_featureFileRelativePath: 'behave tests/some tests/duplicate_fail.feature',
      scenario_featureName: 'Duplicate',
      scenario_getLabel: 'run a test',
      scenario_isOutline: false,
      scenario_result: 'Failing step: When we implement a failing test ... failed\nTraceback (most recent call last):\n  File -snip- assert successful_or_failing == "successful"\nAssertionError',
      scenario_scenarioName: 'run a test',
      test_children: undefined,
      test_description: undefined,
      test_error: undefined,
      test_id: '.../example-project-1/behave tests/some tests/duplicate_fail.feature/run a test',
      test_label: 'run a test',
      test_parent: '.../example-project-1/behave tests/some tests/duplicate_fail.feature',
      test_uri: '.../example-project-1/behave tests/some tests/duplicate_fail.feature'
    }),

    new TestResult({
      scenario_fastSkipTag: false,
      scenario_featureFileRelativePath: 'behave tests/some tests/group2_features/envvars.feature',
      scenario_featureName: 'EnvVars',
      scenario_getLabel: 'run an successful envvars test',
      scenario_isOutline: false,
      scenario_result: 'passed',
      scenario_scenarioName: 'run an successful envvars test',
      test_children: undefined,
      test_description: undefined,
      test_error: undefined,
      test_id: '.../example-project-1/behave tests/some tests/group2_features/envvars.feature/run an successful envvars test',
      test_label: 'run an successful envvars test',
      test_parent: '.../example-project-1/behave tests/some tests/group2_features/envvars.feature',
      test_uri: '.../example-project-1/behave tests/some tests/group2_features/envvars.feature'
    })
  ];


  const wkspSettings = config.workspaceSettings[wkspUri.path];
  return applyTestConfiguration(debug, wkspSettings, expectedResults);
}