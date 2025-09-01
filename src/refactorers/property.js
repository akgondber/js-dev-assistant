import { walk } from "meriyah-walker";
import MagicString from "magic-string";

import { getTree } from "../extractors.js";

const refactorProperty = (content, propertyName, newName) => {
  const tree = getTree(content);
  const ms = new MagicString(content);

  walk(tree, {
    enter(node, _parent, _key, _index) {
      if (node.type === "MemberExpression") {
        if (
          node.property.type === "Identifier" &&
          node.property.name === propertyName
        ) {
          ms.update(node.property.start, node.property.end, newName);
        }
      }
    },
  });

  return ms.toString();
};

const getAllProperties = (content) => {
  const properties = [];
  const tree = getTree(content);

  walk(tree, {
    enter(node, _parent, _key, _index) {
      if (node.type === "MemberExpression") {
        if (node.property.type === "Identifier") {
          if (!properties.includes(node.property.name)) {
            properties.push(node.property.name);
          }
        }
      }
    },
  });

  return properties;
};

export { refactorProperty, getAllProperties };
