import { walk } from "meriyah-walker";
import MagicString from "magic-string";
import { getTree } from "../../extractors.js";
import { isNumeric, quotify } from "../../utils.js";
import { buildResult } from "../manipulator-utils.js";

const appendItemToArrayVariable = (content, targetVariable, newItem) => {
  const tree = getTree(content);
  const ms = new MagicString(content);
  let hasChanged = false;

  walk(tree, {
    enter(node, _parent, _key, _index) {
      if (node.type === "VariableDeclarator") {
        if (
          node.init.type === "ArrayExpression" &&
          node.id.name === targetVariable
        ) {
          const lastElement = node.init.elements[node.init.elements.length - 1];
          let appendable = `${isNumeric(newItem) ? newItem : quotify(newItem)}`;
          let endIndex = node.end - 1;

          if (lastElement !== undefined) {
            appendable = `, ${appendable}`;
            endIndex = lastElement.end;
          }

          hasChanged = true;
          ms.appendLeft(endIndex, appendable);
        }
      }
    },
  });

  return buildResult(hasChanged, ms.toString());
};

const getArrayVariableElements = (content, targetVariable) => {
  const tree = getTree(content);
  const elements = [];

  walk(tree, {
    enter(node, _parent, _key, _index) {
      if (node.type === "VariableDeclarator") {
        if (
          node.init.type === "ArrayExpression" &&
          targetVariable === node.id.name
        ) {
          node.init.elements.forEach((current) => {
            if (!elements.includes(current.value)) {
              elements.push(current.value);
            }
          });
        }
      }
    },
  });

  return elements;
};

export { appendItemToArrayVariable, getArrayVariableElements };
