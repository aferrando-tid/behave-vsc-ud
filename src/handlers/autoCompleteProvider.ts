import * as vscode from 'vscode';
import { getWorkspaceSettingsForFile, getWorkspaceUriForFile, sepr } from '../common';
import { config } from '../configuration';
import { featureFileStepRe } from "../parsers/featureParser";
import { getStepFileSteps } from '../parsers/stepsParser';


export const autoCompleteProvider = {
  provideCompletionItems(document: vscode.TextDocument, position: vscode.Position): vscode.CompletionItem[] | undefined {
    try {
      const lcLine = document.lineAt(position).text.trimStart().toLowerCase();
      const step = featureFileStepRe.exec(lcLine);
      if (!step)
        return;

      const wkspSettings = getWorkspaceSettingsForFile(document.uri);
      if (!wkspSettings)
        return;

      const stepType = step[1].trim();
      const textWithoutType = step[2].trim();

      let matchText1 = `^${stepType}${sepr}${textWithoutType}`;
      const matchText2 = `^step${sepr}${textWithoutType}`;

      if (stepType === "and" || stepType === "but") {
        for (let i = position.line - 1; i > -1; i--) {
          const lcPrevLine = document.lineAt(i).text.trimStart().toLowerCase();
          const prevStep = featureFileStepRe.exec(lcPrevLine);
          if (prevStep && prevStep[1].trim() !== "and" && prevStep[1].trim() !== "but") {
            const prevStepType = prevStep[1].trim();
            matchText1 = `^${prevStepType}${sepr}${textWithoutType}`;
            break;
          }
        }
      }

      const stepFileSteps = getStepFileSteps(wkspSettings.featuresUri);
      const items: vscode.CompletionItem[] = [];

      for (const [key, value] of stepFileSteps) {
        const lcKey = key.toLowerCase();
        if (lcKey.startsWith(matchText1) || lcKey.startsWith(matchText2)) {
          let itemText = value.textAsRe.startsWith(".*") ? " " + value.textAsRe.slice(1) : value.textAsRe;
          itemText = value.textAsRe.replaceAll(".*", "?");
          // deal with e.g \( escapes in textAsRe
          itemText = itemText.replaceAll("\\\\", "#@slash@#").replaceAll("\\", "").replaceAll("#@slash@#", "\\");
          itemText = itemText.replace(textWithoutType, "").trim();
          const item = new vscode.CompletionItem(itemText, vscode.CompletionItemKind.Function);
          item.detail = vscode.workspace.asRelativePath(value.uri);
          items.push(item);
        }
      }

      return items;
    }
    catch (e: unknown) {
      // entry point function (handler) - show error
      try {
        const wkspUri = getWorkspaceUriForFile(document.uri);
        config.logger.showError(e, wkspUri);
      }
      catch {
        config.logger.showError(e);
      }
    }
  }

}


