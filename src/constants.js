import chalk from "chalk";
import figureSet from "figures";

const colon = ":";
const endstring = chalk.bgWhite.black("(END)");
const successPrefix = `${chalk.green(figureSet.tick)} `;
const infoPrefix = `${chalk.blue(figureSet.info)} `;
const errorPrefix = `${chalk.red(figureSet.cross)} `;
const renameSign = chalk.bold(figureSet.arrowRight);

export { colon, endstring, successPrefix, infoPrefix, errorPrefix, renameSign };
