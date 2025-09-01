import { select, text, log } from "@clack/prompts";
import * as R from "radash";
import fs from "node:fs";
import { getFileContent } from "../extractors.js";
import { fileIsValid } from "../meriyah-utils/file-is-valid.js";
import { getAllArrayVariables } from "../extractors/array-variables-extractor.js";
import { getAllObjectVariables } from "../extractors/object-variables-extractor.js";
import { addKeyValuePair } from "./object-manipulators/add-key-value-pair.js";
import { removeKeyValuePair } from "./object-manipulators/remove-key-value-pair.js";
import { updateValueForKey } from "./object-manipulators/update-value-for-key.js";
import { appendItemToArrayVariable } from "./array-manipulators/append-item-to-array-variable.js";
import { removeItemsFromArrayVariable } from "./array-manipulators/remove-items-from-array-variable.js";

const manipulate = async (file) => {
  const manipulationSubject = await select({
    message: "What kind of manipulation you want to perform?",
    options: [
      {
        label: "array: append item",
        value: "appendItemToArray",
      },
      {
        label: "array: remove items",
        value: "removeItemsFromArray",
      },
      {
        label: "object: add key value pair to object",
        value: "addKeyValueForObject",
      },
      {
        label: "object: update value for some key",
        value: "changeValueForObject",
      },
      {
        label: "object: remove key value pair",
        value: "removeKeyValuePair",
      },
    ],
  });

  const arrayManipulations = ["appendItemToArray", "removeItemsFromArray"];
  const objectManipulations = [
    "addKeyValueForObject",
    "changeValueForObject",
    "removeKeyValuePair",
  ];

  const fileContent = getFileContent(file);
  if (!fileIsValid(fileContent)) {
    return {
      file,
      success: false,
      reason: "The source file is not valid javascript, please check its content.",
    };
  }

  let commandResult = {
    hasChanged: false,
  };
  if (arrayManipulations.includes(manipulationSubject)) {
    let arrayVariables = [];

    if (manipulationSubject === "appendItemToArray") {
      arrayVariables = getAllArrayVariables(fileContent);

      if (!R.isEmpty(arrayVariables)) {
        const chosenVariable = await select({
          message: "What is a variable you want to manipulate on?",
          options: arrayVariables.map((item) => ({
            label: item,
            value: item,
          })),
        });

        const newItem = await text({
          message: "What is new item to append?",
          validate: (value) => {
            if (value.length === 0) {
              return "This field is required";
            }
          },
        });
        commandResult = appendItemToArrayVariable(
          fileContent,
          chosenVariable,
          newItem,
        );
      } else {
        log.info(`There is no array variables in ${file}`);
      }
    } else if (manipulationSubject === "removeItemsFromArray") {
      arrayVariables = getAllArrayVariables(fileContent, { isNotEmpty: true });

      const chosenVariable = await select({
        message: "What is a variable you want to manipulate on?",
        options: arrayVariables.map((item) => ({
          label: item,
          value: item,
        })),
      });

      commandResult = await removeItemsFromArrayVariable(
        fileContent,
        chosenVariable,
      );
    }
  } else if (objectManipulations.includes(manipulationSubject)) {
    if (manipulationSubject === "addKeyValueForObject") {
      const objectVarialbles = getAllObjectVariables(fileContent);
      const targetObjectVariable = await select({
        message: "Select a target variable",
        options: objectVarialbles.map((item) => ({
          label: item,
          value: item,
        })),
      });
      commandResult = await addKeyValuePair(fileContent, targetObjectVariable);
    } else if (manipulationSubject === "changeValueForObject") {
      const objectVarialbles = getAllObjectVariables(fileContent, {
        isNotEmpty: true,
      });
      if (R.isEmpty(objectVarialbles)) {
        log.info(`There are no object variables stored with key/value pairs.`);
      } else {
        const targetObjectVariable = await select({
          message: "Select a target variable",
          options: objectVarialbles.map((item) => ({
            label: item,
            value: item,
          })),
        });
        commandResult = await updateValueForKey(fileContent, targetObjectVariable);
      }
    } else if (manipulationSubject === "removeKeyValuePair") {
      const objectVariables = getAllObjectVariables(fileContent, {
        isNotEmpty: true,
      });
      if (R.isEmpty(objectVariables)) {
        log.info(`There are no object variables stored with key/value pairs.`);
      } else {
        const targetObjectVariable = await select({
          message: "Select a target variable",
          options: objectVariables.map((item) => ({
            label: item,
            value: item,
          })),
        });
        commandResult = await removeKeyValuePair(fileContent, targetObjectVariable);
      }
    }
  }

  if (commandResult.hasChanged) {
    fs.writeFileSync(file, commandResult.content);
  }

  const mainOptions = {
    file,
    hasChanged: commandResult.hasChanged,
    subject: manipulationSubject,
    newContent: commandResult.content,
  };

  return {
    ...mainOptions,
    success: true,
  };
};

export { manipulate };
