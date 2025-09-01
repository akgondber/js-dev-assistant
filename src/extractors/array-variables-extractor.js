import { walk } from "meriyah-walker";
import { getTree } from "../extractors.js";

const getAllArrayVariables = (content, { isNotEmpty } = { isNotEmpty: false }) => {
  const tree = getTree(content);
  const arrayVariables = [];

  walk(tree, {
    enter(node, _parent, _key, _index) {
      if (node.type === "VariableDeclarator") {
        if (node.init !== null && node.init.type === "ArrayExpression") {
          if (!arrayVariables.includes(node.id.name)) {
            if (!(isNotEmpty && node.init.elements.length === 0)) {
              arrayVariables.push(node.id.name);
            }
          }
        }
      }
    },
  });

  return arrayVariables;
};

export { getAllArrayVariables };
