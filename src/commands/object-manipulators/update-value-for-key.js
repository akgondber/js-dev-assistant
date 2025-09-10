import { asyncWalk } from "meriyah-walker";
import MagicString from "magic-string";
import { select } from "@clack/prompts";
import { getTree } from "../../extractors.js";
import { askValue } from "../../clack-helpers.js";
import { isKeyEq, maybeQuoted, selectible } from "../../utils.js";
import { buildResult } from "../manipulator-utils.js";

const updateValueForKey = async (content, targetVariable) => {
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

          const toOverrideNode = node.init.properties.find(isKeyEq(selectedKey));
          const value = await askValue();
          hasContentChanged = true;
          ms.update(
            toOverrideNode.value.start,
            toOverrideNode.value.end,
            maybeQuoted(value),
          );
        }
      }
    },
  });

  return buildResult(hasContentChanged, ms.toString());
};

export { updateValueForKey };
