import { asyncWalk } from "meriyah-walker";
import MagicString from "magic-string";
import { multiselect } from "@clack/prompts";
import * as R from "radash";
import { getTree } from "../../extractors.js";
import { buildResult } from "../manipulator-utils.js";
import { getAllBinaryExpressionsIndexes, getAllTargetIndexes } from "../../utils.js";

const removeItemsFromArrayVariable = async (content, targetVariable) => {
  const tree = getTree(content);
  const ms = new MagicString(content);
  let hasChanged = false;

  await asyncWalk(tree, {
    async enter(node, _parent, _key, _index) {
      if (node.type === "VariableDeclarator") {
        if (
          node.init.type === "ArrayExpression" &&
          node.id.name === targetVariable
        ) {
          const optionsToSelect = [];
          node.init.elements.forEach((item) => {
            if (item.type === "BinaryExpression") {
              if (
                !optionsToSelect.find(
                  (currentOption) =>
                    currentOption.value ===
                    `${item.left.value} ${item.operator} ${item.right.value}`,
                )
              ) {
                optionsToSelect.push({
                  label: `${item.left.value} ${item.operator} ${item.right.value}`,
                  value: `${item.left.value} ${item.operator} ${item.right.value}`,
                });
              }
            } else if (item.type === "Literal") {
              if (
                !optionsToSelect.find(
                  (currentOption) => currentOption.value === item.value,
                )
              ) {
                optionsToSelect.push({
                  label: item.value,
                  value: item.value,
                });
              }
            }
          });
          if (!R.isEmpty(optionsToSelect)) {
            const chosenItems = await multiselect({
              message: "What items you want to remove?",
              options: optionsToSelect,
            });
            const processedIndexes = [];

            chosenItems.forEach((item) => {
              let computedIndexes = getAllTargetIndexes(node.init.elements, item);
              if (R.isEmpty(computedIndexes)) {
                computedIndexes = getAllBinaryExpressionsIndexes(
                  node.init.elements,
                  item,
                );
              }

              computedIndexes.forEach((currentIndex) => {
                const targetNode = node.init.elements[currentIndex];
                if (currentIndex > 0 && processedIndexes[0] !== 0) {
                  const prevArrayItemNode = node.init.elements[currentIndex - 1];
                  ms.remove(prevArrayItemNode.end, targetNode.end);
                } else {
                  const hasNextItem = currentIndex + 1 < node.init.elements.length;
                  let endIndex = targetNode.end;

                  if (hasNextItem) {
                    endIndex = node.init.elements[currentIndex + 1].start;
                  }

                  ms.remove(targetNode.start, endIndex);
                }

                if (!hasChanged) {
                  hasChanged = true;
                }
                processedIndexes.push(currentIndex);
              });
            });
          }
        }
      }
    },
  });

  return buildResult(hasChanged, ms.toString());
};

export { removeItemsFromArrayVariable };
