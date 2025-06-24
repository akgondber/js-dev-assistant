import fs from "node:fs";
import readline from "readline";
import ansiEscapes from "ansi-escapes";
import { log, select, outro, group, text } from "@clack/prompts";
import terminalSize from "terminal-size";
import { EOL } from "node:os";

import {
  buildOptions,
  selectAndPromptNewName,
  selectJsFile,
} from "./clack-helpers.js";
import { cleanConsole, readFile, writeToFile } from "./utils.js";
import { getFileContent, getTree } from "./extractors.js";
import { getAllVariables, refactorVariable } from "./refactorers/variable.js";
import { getPlaceholder, getVisibleLines } from "./viewport.js";
import { colon, endstring } from "./constants.js";
import { spinner } from "@clack/prompts";
import chalk from "chalk";
import { getAllProperties, refactorProperty } from "./refactorers/property.js";

const runRefactor = async (file) => {
  // const file = await selectJsFile(`What is file you want to refactor?`);
  const fileContent = getFileContent(file);

  const refactoringSubject = await select({
    message: "What is a subject of refactoring?",
    options: [
      {
        label: "variable",
        value: "variable",
      },
      {
        label: "property",
        value: "property",
      },
    ],
  });

  const mainOptions = {
    file: file,
    subject: refactoringSubject,
  };

  if (refactoringSubject === "variable") {
    const assignments = getAllVariables(fileContent);

    if (assignments.length === 0) {
      log.info(
        "It seems there are no variable declarations in the source file.",
      );
      outro("Exiting.");
      process.exit(0);
    }

    const variableOptions = buildOptions(assignments);

    const inputs = await group(
      {
        variableName: () =>
          select({
            message: "What is variable name you want to refactor?",
            options: variableOptions,
          }),
        newVariableName: () => text({ message: "New variable name" }),
      },
      {
        onCancel: () => {
          cancel("Refactoring cancelled.");
          process.exit(0);
        },
      },
    );
    const s = spinner();
    s.start(
      `Changing ${chalk.bold(inputs.variableName)} to ${chalk.bold(inputs.newVariableName)}`,
    );

    const newContent = refactorVariable(
      fileContent,
      inputs.variableName,
      inputs.newVariableName,
    );
    s.stop(
      `Changed ${chalk.bold(inputs.variableName)} to ${chalk.bold(inputs.newVariableName)}`,
    );
    fs.writeFileSync(file, newContent);

    return {
      ...mainOptions,
      success: true,
      itemName: inputs.variableName,
      newName: inputs.newVariableName,
    };
  } else if (refactoringSubject === "property") {
    const propertiesOptions = buildOptions(getAllProperties(fileContent));
    const inputs = await selectAndPromptNewName({
      selectOptions: propertiesOptions,
      selectMessage: "What is property name you would to refactor?",
      newNameMessage: "New property name:",
    });
    // log.info(fileContent);
    const afterRefactoring = refactorProperty(
      fileContent,
      inputs.itemName,
      inputs.newName,
    );
    writeToFile(file, afterRefactoring);

    return {
      ...mainOptions,
      success: true,
      itemName: inputs.itemName,
      newName: inputs.newName,
    };
  }

  return {
    success: false,
    message: "There is no availbale refactorer for this subject",
    file: file,
  };
};

const runView = async (file) => {
  const { columns, rows } = terminalSize();
  const lastRow = rows - 1;
  const fileContent = readFile(file);

  let newLineCounter = 0;
  let j = 0;
  let stringView = "";
  let indexNewlineTakenIntoConsideration = 0;
  let prevIndex = -1;

  for (let i = 0; i < fileContent.length; i++) {
    if (prevIndex > -1) {
      if (
        fileContent[prevIndex] === "\n" ||
        fileContent[prevIndex] === "\r\n"
      ) {
        indexNewlineTakenIntoConsideration = 0;
      }
    }

    indexNewlineTakenIntoConsideration++;

    j++;

    if (indexNewlineTakenIntoConsideration > columns) {
      stringView += EOL;
      indexNewlineTakenIntoConsideration = 0;
      newLineCounter++;
      j = 0;
    }
    stringView += fileContent[i];
    prevIndex = i;
  }
  let lines = stringView.split(EOL);
  let loopCount = Math.min(lines.length, rows) - 1;

  cleanConsole();

  for (let i = 0; i < loopCount; i++) {
    process.stdout.write(lines[i]);
    if (i < rows - 1) {
      process.stdout.write(EOL);
    }
  }

  process.stdout.write(ansiEscapes.cursorTo(0, lastRow));
  process.stdout.write(lines.length < lastRow ? endstring : colon);

  readline.emitKeypressEvents(process.stdin);
  if (process.stdin.isTTY) process.stdin.setRawMode(true);
  process.stdin.resume();

  let scrollOffset = 0;

  const keypressListener = (ch, key) => {
    if (key && key.name === "y") {
    } else if (key && key.name === "down") {
      if (scrollOffset + rows >= stringView.split(EOL).length) {
        return;
      }
      scrollOffset++;
      process.stdout.write(ansiEscapes.clearTerminal);
      process.stdout.write(
        getVisibleLines(stringView, { rows: rows - 1, scrollOffset }),
      );
      process.stdout.write(ansiEscapes.cursorNextLine);
      process.stdout.write(getPlaceholder(stringView, rows, scrollOffset));

      // process.stdout.write(ansiEscapes.cursorUp());
    } else if (key && key.name === "up") {
      if (scrollOffset <= 0) {
        return;
      }

      scrollOffset--;
      process.stdout.write(ansiEscapes.clearTerminal);
      process.stdout.write(
        getVisibleLines(stringView, { rows: rows - 1, scrollOffset }),
      );
      process.stdout.write(ansiEscapes.cursorNextLine);
      process.stdout.write(":");
      // process.stdout.write(ansiEscapes.cursorUp());
    } else if (key && key.name === "q") {
      cleanConsole();
      process.stdin.pause();
    } else if (key && key.ctrl && key.name === "c") {
      cleanConsole();
      process.stdin.pause();
    }
  };

  process.stdin.on("keypress", keypressListener);
};

export { runRefactor, runView };
