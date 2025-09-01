import { asyncWalk } from "meriyah-walker";
import MagicString from "magic-string";
import { EOL } from "node:os";
import { getTree } from "../../extractors.js";
import { isKeyEq, selectible } from "../../utils.js";
import { select } from "@clack/prompts";
import { buildResult } from "../manipulator-utils.js";

const removeKeyValuePair = async (content, targetVariable) => {
  const tree = getTree(content);
  const ms = new MagicString(content);
  let hasContentChanged = false;

  await asyncWalk(tree, {
    async enter(node, _parent, _key, _index) {
      if (node.type === "VariableDeclarator") {
        if (
          node.init.type === "ObjectExpression" &&
          node.id.name === targetVariable
        ) {
          const properties = node.init.properties;
          const objectKeys = properties.map((current) => current.key.name);

          const selectedKey = await select({
            message: "Choose a key",
            options: objectKeys.map(selectible),
          });
          const toRemoveNode = node.init.properties.find(isKeyEq(selectedKey));
          let endIndex = toRemoveNode.value.end;
          hasContentChanged = true;
          let computedEndIndex =
            ms.slice(endIndex, endIndex + 1) === "," ? endIndex + 1 : endIndex;

          if (ms.slice(toRemoveNode.value.end, toRemoveNode.value.end + 1) === ",") {
            endIndex = endIndex + 1;
            let nextChar = ms.slice(endIndex, endIndex + 1);
            let rightIterationCounter = 0;
            let rightSpacesCount = 0;
            let onlySpacesInRightDirection = true;

            while (
              !(nextChar === "\n" || nextChar === "\r\n") &&
              onlySpacesInRightDirection
            ) {
              rightIterationCounter++;

              if (!(nextChar === " " || nextChar === "\t")) {
                onlySpacesInRightDirection = false;
                break;
              }
              if (nextChar + 2 < ms.length) {
                nextChar = ms.slice(nextChar + 1, nextChar + 2);
                rightSpacesCount++;
              } else {
                onlySpacesInRightDirection = false;
                break;
              }
            }

            if (rightIterationCounter > 0 && onlySpacesInRightDirection) {
              computedEndIndex += rightSpacesCount;
            }
          }
          let beginIndex = toRemoveNode.key.start;
          let previousChar = ms.slice(beginIndex - 1, beginIndex);
          let gonaBeEmptyLineAfterRemove = false;
          let hasOnlySpaces = true;
          let iterationCount = 0;
          let computedStartIndex = toRemoveNode.key.start;

          while (
            !(
              previousChar === "\n" ||
              previousChar === "\r\n" ||
              previousChar === EOL
            ) &&
            hasOnlySpaces
          ) {
            console.log(`PREV: "${previousChar}"`);
            iterationCount++;
            if (!(previousChar === " " || previousChar === "\t")) {
              hasOnlySpaces = false;
              break;
            }
            if (beginIndex - 2 > -1) {
              previousChar = ms.slice(beginIndex - 2, beginIndex - 1);
              beginIndex--;
            } else {
              break;
            }
          }
          gonaBeEmptyLineAfterRemove = hasOnlySpaces;
          if (iterationCount > 0 && gonaBeEmptyLineAfterRemove) {
            computedStartIndex = beginIndex - 1;
          }
          console.log(
            `COST : ${computedStartIndex}; nodeStInd: ${toRemoveNode.key.start}`,
          );

          ms.remove(computedStartIndex, computedEndIndex);
        }
      }
    },
  });

  return buildResult(hasContentChanged, ms.toString());
};

export { removeKeyValuePair };
