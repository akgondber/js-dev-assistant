#!/usr/bin/env node

import { defineCommand, runMain } from "citty";
import { intro, outro, log } from "@clack/prompts";
import chalk from "chalk";

import { selectCommand, selectJsFile } from "./clack-helpers.js";
import { fileExists, isAvailableCommandName } from "./utils.js";
import { runRefactor, runView } from "./run.js";
import { renameSign, successPrefix } from "./constants.js";

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
    let file = context.args.file;
    const { root } = context.args;

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

    if (operation === "view") {
      await runView(file);
    } else if (operation === "refactor") {
      const result = await runRefactor(file);

      if (result.success) {
        log.success(
          `${chalk.strikethrough.italic(result.itemName)} ${renameSign} ${chalk.bold(result.newName)}`,
        );
        outro(`${successPrefix}${result.file} has been refactored.`);
      }
    }
  },
});

runMain(main);
