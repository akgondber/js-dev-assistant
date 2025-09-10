#!/usr/bin/env node

import { defineCommand, runMain } from "citty";
import { intro, outro, log } from "@clack/prompts";
import chalk from "chalk";
import * as R from "radash";
import { execa } from "execa";

import { selectCommand, selectJsFile } from "./clack-helpers.js";
import { fileExists, isAvailableCommandName } from "./utils.js";
import { runRefactor, runView } from "./run.js";
import { errorPrefix, renameSign, successPrefix } from "./constants.js";
import { manipulate } from "./commands/manipulate.js";

const main = defineCommand({
  meta: {
    name: "dev-assistant",
    version: "1.0.0",
    description:
      "Manipulate over source files - refactor, view, etc. not leaving a terminal",
  },
  args: {
    command: {
      type: "positional",
      required: false,
      description:
        "An optional command name (refactor, view...), will be prompted interactively if not provided",
    },
    root: {
      type: "string",
      description: "Root folder to search files on",
    },
    file: {
      type: "string",
      description: "source file name",
      alias: ["f"],
    },
    hook: {
      type: "string",
      description: "custom hook to perform over changed file",
    },
    prettierHook: {
      type: "boolean",
      description: "perform prettier format command over changed file",
      alias: ["p", "prettify"],
    },
    viewAfterManipulation: {
      type: "boolean",
      description: "Run view file command after manipulation over file",
      alias: ["viewAfter", "viaf", "thenView"],
      default: false,
    },
  },
  run: async (context) => {
    intro("Starting a command");

    let operation;

    if (context.args.command) {
      if (!isAvailableCommandName(context.args.command)) {
        log.info(
          `Command ${chalk.bold(context.args.command)} is not available, so...`,
        );

        operation = await selectCommand({
          message: "Select a command in interactive mode:",
        });
      } else {
        operation = context.args.command;
      }
    } else {
      operation = await selectCommand();
    }
    let { file } = context.args;
    const { root, hook, prettierHook, viewAfterManipulation } = context.args;

    if (context.args.file) {
      if (!fileExists(context.args.file)) {
        log.info(
          `File - ${chalk.bold(context.args.file)} does not exist, select from existing ones...`,
        );
        file = await selectJsFile({
          root,
          message: `What is file you want to ${operation}?`,
        });
      }
    } else {
      file = await selectJsFile({
        root,
        message: `What is file you want to ${operation}?`,
      });
    }
    let applicableForHook = false;
    let succeeded = false;
    let resultMessage = "";

    if (operation === "view") {
      await runView(file);
    } else if (operation === "refactor") {
      const result = await runRefactor(file);

      if (result.success) {
        log.success(
          `${chalk.strikethrough.italic(result.itemName)} ${renameSign} ${chalk.bold(result.newName)}`,
        );
        applicableForHook = true;
        succeeded = true;
        resultMessage = `File has been refactored.`;
      }
    } else if (operation === "manipulate") {
      const result = await manipulate(file);

      if (result.success) {
        succeeded = true;
        if (result.hasChanged) {
          resultMessage = `The source file has been updated.`;
          applicableForHook = true;
        } else {
          resultMessage = `Done (without modifications).`;
        }
      } else {
        resultMessage = R.get(result, "reason", "Failed processing a command.");
      }
    }

    if (operation !== "view") {
      outro(`${succeeded ? successPrefix : errorPrefix}${resultMessage}`);

      if (applicableForHook && prettierHook) {
        await execa({
          stdout: ["pipe", "inherit"],
        })`prettier --ignore-path '' --write ${file}`;
      }

      if (applicableForHook && hook !== undefined) {
        intro(`Applying custom hook: ${chalk.bold(hook)}`);

        await execa({ stdout: ["inherit"] })`${hook}`;

        outro(`${successPrefix}Custom hook has been performed`);
      }

      if (viewAfterManipulation) {
        await runView(file);
      }
    }
  },
});

runMain(main);
