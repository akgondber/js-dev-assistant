import chalk from "chalk";
import figureSet from "figures";

const colon = ":";
const endstring = chalk.bgWhite.black("(END)");
const successPrefix = `${chalk.green(figureSet.tick)} `;
const renameSign = chalk.bold(figureSet.arrowRight);

export { colon, endstring, successPrefix, renameSign };
