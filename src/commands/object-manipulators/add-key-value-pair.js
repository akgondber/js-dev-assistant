import { asyncWalk } from "meriyah-walker";
import * as R from "radash";
import MagicString from "magic-string";
import { confirm, log } from "@clack/prompts";
import { getTree } from "../../extractors.js";
import { askValue, getText } from "../../clack-helpers.js";
import { isKeyEq, maybeQuoted, primitivify } from "../../utils.js";
import { buildResult } from "../manipulator-utils.js";

const addKeyValuePair = async (content, targetVariable) => {
  const tree = getTree(content);
  const ms = new MagicString(content);
  let hasContentChanged = false;

  await asyncWalk(tree, {
    async enter(node, _parent, _key, _index) {
      if (node.type === "VariableDeclarator") {
        if (
          node.init !== null &&
          node.init.type === "ObjectExpression" &&
          node.id.name === targetVariable
        ) {
          const properties = node.init.properties;
          let endIndex = node.init.end;

          if (!R.isEmpty(properties)) {
            const lastPropertyNode = R.last(properties);
            endIndex = lastPropertyNode.end;
          }

          const key = await getText("What is a new key?");

          let needsToBeOverriden = false;

          if (node.init.properties.some((prop) => prop.key.name === key)) {
            needsToBeOverriden = await confirm({
              message: "This key already exists, would you like to override it?",
              initialValue: true,
            });
            if (!needsToBeOverriden) {
              log.info(
                `Operation cancelled since the key already was present in the object.`,
              );
              return;
            }
          }

          if (needsToBeOverriden) {
            const toOverrideNode = node.init.properties.find(isKeyEq(key));

            if (toOverrideNode !== null) {
              const value = await askValue();

              if (toOverrideNode.value.value !== primitivify(value)) {
                ms.update(
                  toOverrideNode.value.start,
                  toOverrideNode.value.end,
                  maybeQuoted(value),
                );
                hasContentChanged = true;
                return;
              }
            }
          } else {
            const value = await askValue();
            ms.appendLeft(endIndex, `, ${key}: ${maybeQuoted(value)}`);
            hasContentChanged = true;
          }
        }
      }
    },
  });

  return buildResult(hasContentChanged, ms.toString());
};

export { addKeyValuePair };
