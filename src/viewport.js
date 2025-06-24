import { EOL } from "node:os";
import { colon, endstring } from "./constants.js";

const getVisibleLines = (str, { rows, scrollOffset, scrollDirection }) => {
  if (rows >= str.length) {
    return str;
  }
  scrollDirection ||= "up";

  return str
    .split(EOL)
    .slice(scrollOffset, rows + scrollOffset)
    .join(EOL);
  // if (scrollDirection === 'up') {
  //     for (let i = 0; i < rows; i++) {

  //     }
  // }
};

const getPlaceholder = (stringView, rows, scrollOffset) => {
  return scrollOffset + rows < stringView.split(EOL).length ? colon : endstring;
};

export { getVisibleLines, getPlaceholder };
