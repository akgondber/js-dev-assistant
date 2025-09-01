import { text, cancel, isCancel, select, group } from "@clack/prompts";

import { fileExists, getJsFiles } from "./utils.js";

const handleCancel = (value) => {
  if (isCancel(value)) {
    cancel("Operation cancelled.");
    process.exit(0);
  }
};

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

const getText = async (message) => {
  const result = await text({ message });
  handleCancel(result);
  return result;
};

const askValue = async () => {
  const result = await getText("What is a value?");
  return result;
};

const selectJsFile = async ({ root, message }) => {
  const files = getJsFiles({ root });
  const filesOptions = buildOptions(files);
  const file = await select({
    message,
    options: filesOptions,
  });

  handleCancel(file);
  return file;
};

const selectCorrectJsFile = async ({ file, message }) => {
  if (!file || !fileExists(file)) {
    if (file) {
      lo;
    }
    file = await selectJsFile({ message });
  }

  handleCancel(file);
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
      {
        label: "manipulate (perform some modifications over arrays, objects, etc.)",
        value: "manipulate",
      },
    ],
  });

  handleCancel(command);
  return command;
};

export {
  buildOptions,
  getText,
  selectAndPromptNewName,
  selectJsFile,
  selectCorrectJsFile,
  selectCommand,
  askValue,
};
