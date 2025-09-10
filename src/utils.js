import { fdir } from "fdir";
import fs from "node:fs";
import * as R from "radash";
import ansiEscapes from "ansi-escapes";
import { getTree } from "./extractors.js";

const writeToFile = (file, data) => {
  fs.writeFileSync(file, data);
};

const readFile = (file) => {
  return fs.readFileSync(file, "utf8");
};

const fileExists = (file) => {
  return fs.existsSync(file);
};

const getFdirFiles = ({ extensions, excludeDirs, root }) => {
  let fdirInstance = new fdir();
  if (extensions && extensions.length > 0) {
    const withDots = extensions.map((ext) => `.${ext}`);
    fdirInstance = fdirInstance.filter((path, _isDirectory) =>
      withDots.some((ext) => path.endsWith(ext)),
    );
  }

  if (excludeDirs && excludeDirs.length > 0) {
    fdirInstance = fdirInstance.exclude((dirName, _dirPath) =>
      excludeDirs.some((item) => dirName.startsWith(item)),
    );
  }

  fdirInstance = fdirInstance.withBasePath();

  if (root) {
    fdirInstance = fdirInstance.crawl(root);
  } else {
    fdirInstance = fdirInstance.crawl();
  }

  return fdirInstance.sync();
};

const getJsFiles = ({ root } = {}) => {
  return getFdirFiles({
    extensions: ["js"],
    excludeDirs: ["node_modules"],
    root,
  });
};

const isAvailableCommandName = (name) => {
  return ["refactor", "view", "manipulate"].includes(name.toLowerCase());
};

const cleanConsole = () => {
  process.stdout.write(ansiEscapes.clearTerminal);
};

const isNumeric = (str) => {
  if (typeof str !== "string") return false;
  return !isNaN(str) && !Number.isNaN(parseFloat(str));
};

const allArrayElementsAreNumericStrings = (value) => {
  if (value.length === 0) {
    return false;
  }

  return value.every((item) => typeof item === "string" && isNumeric(item));
};

const maybeStringRepr = (item, array) => {
  if (allArrayElementsAreNumericStrings(array)) {
    return quotify(item);
  }

  return item;
};

const isQuoteFree = (val) => {
  return isNumeric(val) || isBool(val) || isExpression(val);
};

const maybeQuoted = (val) => {
  return isQuoteFree(val) ? val : quotify(val);
};

const primitivify = (val) => {
  if (isNumeric(val)) {
    return Number(val);
  } else if (isBool(val)) {
    return typeof val === "boolean" ? val : val === "true";
  }

  return val;
};

const isBool = (val) => {
  return typeof val === "boolean" || val === "true" || val === "false";
};

const isExpression = (val) => {
  return /\w+\.\w+\([\w\W]+\)/.test(val);
};

const getAllTargetIndexes = (arr, val) => {
  const indexes = [];
  for (let i = 0; i < arr.length; i++) {
    if (R.get(arr[i], "value") === val) {
      indexes.push(i);
    }
  }

  return indexes;
};

const getAllBinaryExpressionsIndexes = (arr, val) => {
  const indexes = [];
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].type === "BinaryExpression") {
      const inputTree = getTree(val);
      const targetBinary = inputTree.body[0].expression;

      if (targetBinary.type === "BinaryExpression") {
        if (
          arr[i].left.value === targetBinary.left.value &&
          arr[i].right.value === targetBinary.right.value &&
          arr[i].operator === targetBinary.operator
        ) {
          indexes.push(i);
        }
      }
    }
  }

  return indexes;
};

const hasQuotes = (str) => {
  if (R.isEmpty(str) || str.length < 2) {
    return false;
  }

  const firstChar = str[0];
  const lastChar = str[str.length - 1];

  return (
    (firstChar === '"' || firstChar === "'") &&
    (lastChar === '"' || lastChar === "'")
  );
};

const quotify = (str) => {
  return hasQuotes(str) ? str : `"${str}"`;
};

const isKeyEq = (name) => (node) => {
  return node.key.name === name;
};

const selectible = (item) => {
  return {
    label: item,
    value: item,
  };
};

export {
  readFile,
  writeToFile,
  fileExists,
  getFdirFiles,
  getJsFiles,
  getAllTargetIndexes,
  getAllBinaryExpressionsIndexes,
  isAvailableCommandName,
  cleanConsole,
  isNumeric,
  isBool,
  isExpression,
  isKeyEq,
  hasQuotes,
  quotify,
  maybeQuoted,
  primitivify,
  selectible,
  allArrayElementsAreNumericStrings,
  maybeStringRepr,
};
