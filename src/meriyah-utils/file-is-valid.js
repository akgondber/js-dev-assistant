import { parseModule } from "meriyah";

const fileIsValid = (source) => {
  try {
    parseModule(source, { ranges: true });
    return true;
  } catch (_err) {
    return false;
  }
};

export { fileIsValid };
