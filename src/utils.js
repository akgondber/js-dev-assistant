import { fdir } from "fdir";
import fs from "node:fs";
import ansiEscapes from "ansi-escapes";

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
  return ["refactor", "view"].includes(name.toLowerCase());
};

const cleanConsole = () => {
  process.stdout.write(ansiEscapes.clearTerminal);
};

export {
  readFile,
  writeToFile,
  fileExists,
  getFdirFiles,
  getJsFiles,
  isAvailableCommandName,
  cleanConsole,
};
