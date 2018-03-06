import {
  CheckError,
  isNumber,
  isInteger,
  isString,
  isBool,
  isVal,
} from "./index";

describe("isNumber", () => {
  test(`passing a number returns the number`, () => {
    expect(isNumber(5)).toBe(5);
  });

  test(`passing a string throws a CheckError`, () => {
    const expectedError = new CheckError({
      name: "isNumber",
      value: "s",
      path: ["isNumber"],
    });
    expect(() => isNumber("s")).toThrowError(expectedError);
  });
});

describe("isInteger", () => {
  test(`passing an integer returns the integer`, () => {
    expect(isInteger(5)).toEqual(5);
  });

  test(`passing string throws a CheckError`, () => {
    const expectedError = new CheckError({
      name: "isInteger",
      value: "f",
      path: ["isInteger"],
    });
    expect(() => isInteger("f")).toThrow(expectedError);
  });

  test(`passing float throws a CheckError`, () => {
    const expectedError = new CheckError({
      name: "isInteger",
      value: 5.1,
      path: ["isInteger"],
    });
    expect(() => isInteger(5.1)).toThrow(expectedError);
  });
});

describe("isString", () => {
  test(`passing string returns the string`, () => {
    expect(isString("a string")).toEqual("a string");
  });

  test(`passing an object throws a CheckError`, () => {
    const expectedError = new CheckError({
      name: "isString",
      value: { a: 5 },
      path: ["isString"],
    });
    expect(() => isString({ a: 5 })).toThrow(expectedError);
  });
});

describe("isBool", () => {
  test(`passing boolean returns the boolean`, () => {
    expect(isBool(true)).toEqual(true);
    expect(isBool(false)).toEqual(false);
  });

  test(`passing non-boolean falsey values throws a CheckError`, () => {
    expect(() => isBool(undefined)).toThrow(
      new CheckError({
        name: "isBool",
        value: undefined,
        path: ["isBool"],
      })
    );
    expect(() => isBool(null)).toThrow(
      new CheckError({
        name: "isBool",
        value: null,
        path: ["isBool"],
      })
    );
    expect(() => isBool(0)).toThrow(
      new CheckError({
        name: "isBool",
        value: 0,
        path: ["isBool"],
      })
    );
  });

  test(`passing non-boolean truthy values throws a CheckError`, () => {
    expect(() => isBool("a")).toThrow(
      new CheckError({
        name: "isBool",
        value: "a",
        path: ["isBool"],
      })
    );
    expect(() => isBool(1)).toThrow(
      new CheckError({
        name: "isBool",
        value: 1,
        path: ["isBool"],
      })
    );
    expect(() => isBool([])).toThrow(
      new CheckError({
        name: "isBool",
        value: [],
        path: ["isBool"],
      })
    );
  });
});

describe("isVal", () => {
  test(`passing number returns the number`, () => {
    expect(isVal(6)(6)).toEqual(6);
  });
  test(`passing array returns the array`, () => {
    expect(isVal([1, 2, 3, 4])([1, 2, 3, 4])).toEqual([1, 2, 3, 4]);
    expect(isVal([1, [2, 3]])([1, [2, 3]])).toEqual([1, [2, 3]]);
  });
  test(`passing object returns the object`, () => {
    expect(isVal({ a: 1, b: 2 })({ a: 1, b: 2 })).toEqual({ a: 1, b: 2 });
    expect(isVal({ a: 1, b: { c: 3 } })({ a: 1, b: { c: 3 } })).toEqual({
      a: 1,
      b: { c: 3 },
    });
  });
  test(`passing wrong number throws CheckError`, () => {
    expect(() => isVal(5)(6)).toThrow(
      new CheckError({
        name: "isVal(5)",
        value: 6,
        path: ["isVal(5)"],
      })
    );
  });
  test(`passing wrong value when expecting array throws CheckError`, () => {
    expect(() => isVal([])(5)).toThrow(
      new CheckError({
        name: "isVal([])",
        value: 5,
        path: ["isVal([])"],
      })
    );
    expect(() => isVal([1, 2, 3])([1, 2, 2])).toThrow(
      new CheckError({
        name: "isVal([1,2,3])",
        value: [1, 2, 2],
        path: ["isVal([1,2,3])"],
      })
    );
  });
  test(`passing wrong value when expecting nested array throws CheckError`, () => {
    expect(() => isVal([1, 2, [3]])([1, 2, [4]])).toThrow(
      new CheckError({
        name: "isVal([1,2,[3]])",
        value: [1, 2, [4]],
        path: ["isVal([1,2,[3]])"],
      })
    );
  });
  test(`passing wrong value when expecting object throws CheckError`, () => {
    const isEmptyObject = isVal({});
    const isSimpleObject = isVal({ num: 1, str: "string" });
    const isNestedObject = isVal({ num: 1, arr: [1, "b"], obj: { a: 1 } });

    expect(() => isEmptyObject(5)).toThrow(
      new CheckError({
        name: "isVal({})",
        value: 5,
        path: ["isVal({})"],
      })
    );
    expect(() => isEmptyObject({ a: 1 })).toThrow(
      new CheckError({
        name: "isVal({})",
        value: { a: 1 },
        path: ["isVal({})"],
      })
    );
    expect(() => isSimpleObject({ a: 1 })).toThrow(
      new CheckError({
        name: `isVal({"num":1,"str":"string"})`,
        value: { a: 1 },
        path: [`isVal({"num":1,"str":"string"})`],
      })
    );
    expect(() =>
      isNestedObject({ num: 1, arr: [1, "b"], obj: { a: 2 } })
    ).toThrow(
      new CheckError({
        name: `isVal({"num":1,"arr":[1,"b"],"obj":{"a":1}})`,
        value: { num: 1, arr: [1, "b"], obj: { a: 2 } },
        path: [`isVal({"num":1,"arr":[1,"b"],"obj":{"a":1}})`],
      })
    );
  });
});
