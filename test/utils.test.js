import { expect, test } from "vitest";
import { isNumeric } from "../src/utils";

const numericInputs = ["34", "5.6", "235.546"];

test.each(numericInputs)(`isNumeric(%d) returns true`, (input) => {
  const actual = isNumeric(input);
  expect(actual).toBe(true);
});

const notNumericInputs = ["sd48", "b43", "foo", "baz"];

test.each(notNumericInputs)(`isNumeric(%d) returns false`, (input) => {
  const actual = isNumeric(input);

  expect(actual).toBe(false);
});
