import { walk } from "meriyah-walker";
import { getTree } from "../extractors.js";

const getAllObjectVariables = (content, { isNotEmpty } = { isNotEmpty: false }) => {
  const tree = getTree(content);
  const objectVariables = [];

  walk(tree, {
    enter(node, _parent, _key, _index) {
      if (node.type === "VariableDeclarator") {
        if (node.init?.type === "ObjectExpression") {
          if (!objectVariables.includes(node.id.name)) {
            if (!(isNotEmpty && node.init.properties.length === 0)) {
              objectVariables.push(node.id.name);
            }
          }
        }
      }
    },
  });

  return objectVariables;
};

export { getAllObjectVariables };
