import { expect, test } from "vitest";
import {
  getAllVariables,
  refactorVariable,
} from "../../src/refactorers/variable";

const exampleCode = `
const foo = 4;
const bar = () => {
    console.log('Bar');
};
`;

test("collect all variable names from source", () => {
  const variables = getAllVariables(exampleCode);
  expect(variables).toEqual(["foo", "bar"]);
});

test("refactor specified variable name to a new name", () => {
  const refactored = refactorVariable(exampleCode, "foo", "quxx");
  const expected = `
const quxx = 4;
const bar = () => {
    console.log('Bar');
};
`;
  expect(refactored).toEqual(expected);
});
