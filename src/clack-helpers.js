import { text } from "@clack/prompts";
import { cancel } from "@clack/prompts";
import { select } from "@clack/prompts";
import { group } from "@clack/prompts";

import { fileExists, getJsFiles } from "./utils.js";

const buildOptions = (array) => {
  return array.map((item) => {
    return {
      label: item,
      value: item,
    };
  });
};

const selectAndPromptNewName = async ({
  selectOptions,
  selectMessage,
  newNameMessage,
}) => {
  const result = await group(
    {
      itemName: () =>
        select({
          message: selectMessage,
          options: selectOptions,
        }),
      newName: () => text({ message: newNameMessage }),
    },
    {
      onCancel: () => {
        cancel("Refactoring cancelled.");
        process.exit(0);
      },
    },
  );
  return result;
};

const selectJsFile = async ({ root, message }) => {
  const files = getJsFiles({ root });
  const filesOptions = buildOptions(files);
  const file = await select({
    message,
    options: filesOptions,
  });
  return file;
};

const selectCorrectJsFile = async ({ file, message }) => {
  if (!file || !fileExists(file)) {
    if (file) {
      lo;
    }
    file = await selectJsFile({ message });
  }

  return file;
};

const selectCommand = async ({ message } = {}) => {
  const command = await select({
    message: message || "What kind of operation you want to perform?",
    options: [
      {
        label: "refactor",
        value: "refactor",
      },
      {
        label: "view",
        value: "view",
      },
    ],
  });

  return command;
};

export {
  buildOptions,
  selectAndPromptNewName,
  selectJsFile,
  selectCorrectJsFile,
  selectCommand,
};
