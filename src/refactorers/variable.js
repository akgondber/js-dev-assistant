import MagicString from "magic-string";
import { walk } from "meriyah-walker";
import { getTree } from "../extractors.js";

const getAllVariables = (content) => {
  const tree = getTree(content);
  const assignments = [];

  walk(tree, {
    enter(node, _parent, _key, _index) {
      if (node.type === "VariableDeclarator") {
        if (!assignments.includes(node.id.name)) {
          assignments.push(node.id.name);
        }
      }
    },
  });

  return assignments;
};

const refactorVariable = (content, oldName, newName) => {
  const tree = getTree(content);
  const ms = new MagicString(content);

  walk(tree, {
    enter(node, _parent, _key, _index) {
      if (node.type === "VariableDeclarator") {
        if (node.id.name === oldName) {
          ms.update(node.id.start, node.id.end, newName);
        }
      } else if (node.type === "Identifier") {
        if (node.name === oldName) {
          ms.update(node.start, node.end, newName);
        }
      }
    },
  });

  return ms.toString();
};

export { getAllVariables, refactorVariable };
