import fs from "node:fs";
import { parseModule } from "meriyah";

const getTree = (source) => {
  const result = parseModule(source, { ranges: true });
  return result;
};

const getTreeFromFile = (file) => {
  const content = fs.readFileSync(file, "utf8");
  const result = getTree(content);
  return result;
};

const getFileContent = (file) => {
  return fs.readFileSync(file, "utf8");
};

export { getTree, getTreeFromFile, getFileContent };
