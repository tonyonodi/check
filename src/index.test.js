import {
  CheckError,
  isNumber,
  isInteger,
  isString,
  isBool,
  isVal,
  isInstanceOf,
  isObjectWithShape,
  isArray,
  isArrayOf,
  maybe,
} from "./index";

describe("isNumber", () => {
  test(`passing a number returns the number`, () => {
    expect(isNumber(5)).toBe(5);
  });

  test(`passing a string throws a CheckError`, () => {
    expect(() => isNumber("s")).toThrowErrorMatchingSnapshot();
  });
});

describe("isInteger", () => {
  test(`passing an integer returns the integer`, () => {
    expect(isInteger(5)).toEqual(5);
  });

  test(`passing string throws a CheckError`, () => {
    expect(() => isInteger("f")).toThrowErrorMatchingSnapshot();
  });

  test(`passing float throws a CheckError`, () => {
    expect(() => isInteger(5.1)).toThrowErrorMatchingSnapshot();
  });
});

describe("isString", () => {
  test(`passing string returns the string`, () => {
    expect(isString("a string")).toEqual("a string");
  });

  test(`passing an object throws a CheckError`, () => {
    expect(() => isString({ a: 5 })).toThrowErrorMatchingSnapshot();
  });
});

describe("isBool", () => {
  test(`passing boolean returns the boolean`, () => {
    expect(isBool(true)).toEqual(true);
    expect(isBool(false)).toEqual(false);
  });

  test(`passing non-boolean falsey values throws a CheckError`, () => {
    let error;
    expect(() => isBool(undefined)).toThrowErrorMatchingSnapshot();
    expect(() => isBool(null)).toThrowErrorMatchingSnapshot();
    expect(() => isBool(0)).toThrowErrorMatchingSnapshot();
  });

  test(`passing non-boolean truthy values throws a CheckError`, () => {
    expect(() => isBool("a")).toThrowErrorMatchingSnapshot();
    expect(() => isBool(1)).toThrowErrorMatchingSnapshot();
    expect(() => isBool([])).toThrowErrorMatchingSnapshot();
  });
});

describe(`isArray`, () => {
  test(`passing an array to isArray returns the array`, () => {
    expect(isArray([1, 2, 3])).toEqual([1, 2, 3]);
  });

  test(`passing non-array throws a CheckError`, () => {
    expect(() => isArray(false)).toThrowErrorMatchingSnapshot();
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
    expect(() => isVal(5)(6)).toThrowErrorMatchingSnapshot();
  });
  test(`passing wrong value when expecting array throws CheckError`, () => {
    expect(() => isVal([])(5)).toThrowErrorMatchingSnapshot();
    expect(() => isVal([1, 2, 3])([1, 2, 2])).toThrowErrorMatchingSnapshot();
  });
  test(`passing wrong value when expecting nested array throws CheckError`, () => {
    expect(() =>
      isVal([1, 2, [3]])([1, 2, [4]])
    ).toThrowErrorMatchingSnapshot();
  });
  test(`passing wrong value when expecting object throws CheckError`, () => {
    const isEmptyObject = isVal({});
    const isSimpleObject = isVal({ num: 1, str: "string" });
    const isNestedObject = isVal({ num: 1, arr: [1, "b"], obj: { a: 1 } });

    expect(() => isEmptyObject(5)).toThrowErrorMatchingSnapshot();
    expect(() => isEmptyObject({ a: 1 })).toThrowErrorMatchingSnapshot();
    expect(() => isSimpleObject({ a: 1 })).toThrowErrorMatchingSnapshot();
    expect(() =>
      isNestedObject({ num: 1, arr: [1, "b"], obj: { a: 2 } })
    ).toThrowErrorMatchingSnapshot();
  });
});

describe("isInstanceOf", () => {
  test(`passing correct value returns value`, () => {
    expect(isInstanceOf(Date)(new Date(0))).toEqual(new Date(0));
  });

  test(`passing incorrect value throws CheckError`, () => {
    expect(() => isInstanceOf(Date)(5)).toThrowErrorMatchingSnapshot();
  });
});

describe("isArrayOf", () => {
  const isArrayOfStrings = isArrayOf(isString, { name: "isArrayOfStrings" });

  test(`returns array when given correct values`, () => {
    expect(isArrayOfStrings(["a", "b", "c"])).toEqual(["a", "b", "c"]);
  });

  test(`passing non-array when expecting array throws CheckError`, () => {
    expect(() => isArrayOfStrings(5)).toThrowErrorMatchingSnapshot();
  });

  test(`passing array with element that fails test throws CheckError`, () => {
    expect(() =>
      isArrayOfStrings(["a", 2, "c"])
    ).toThrowErrorMatchingSnapshot();
  });
});

describe("maybe", () => {
  test(`passing undefined returns undefined`, () => {
    expect(maybe(isString)(undefined)).toEqual(undefined);
  });

  test(`passing value with correct type returns value`, () => {
    expect(maybe(isString)("a")).toEqual("a");
  });

  test(`passing value with incorrect type throws CheckError`, () => {
    expect(() => maybe(isString)(5)).toThrowErrorMatchingSnapshot();
  });
});

describe("isObjectWithShape", () => {
  const isPerson = isObjectWithShape(
    {
      req: {
        firstName: isString,
        surname: isString,
        dateOfBirth: isInteger,
      },
      opt: {
        maidenName: isString,
      },
    },
    { name: "isPerson" }
  );
  test(`passing object with correct shape returns object`, () => {
    expect(
      isPerson({
        firstName: "John",
        surname: "Doe",
        dateOfBirth: 1990,
      })
    ).toEqual({
      firstName: "John",
      surname: "Doe",
      dateOfBirth: 1990,
    });

    expect(
      isPerson({
        firstName: "Jane",
        surname: "Doe",
        dateOfBirth: 1990,
        maidenName: "Smith",
      })
    ).toEqual({
      firstName: "Jane",
      surname: "Doe",
      dateOfBirth: 1990,
      maidenName: "Smith",
    });
  });

  test(`passing nested object with correct shape returns nested object`, () => {
    const isCarShape = isObjectWithShape({
      req: {
        seats: isObjectWithShape({
          req: {
            number: isInteger,
            trim: isString,
          },
        }),
        doors: isInteger,
      },
      opt: {
        engine: isObjectWithShape({
          req: {
            size: isInteger,
            aspiration: isString,
            fuel: isString,
          },
        }),
      },
    });
    expect(
      isCarShape({
        seats: {
          number: 4,
          trim: "cloth",
        },
        doors: 4,
        engine: {
          size: 1900,
          aspiration: "turbocharged",
          fuel: "diesel",
        },
      })
    ).toEqual({
      seats: {
        number: 4,
        trim: "cloth",
      },
      doors: 4,
      engine: {
        size: 1900,
        aspiration: "turbocharged",
        fuel: "diesel",
      },
    });
  });

  test(`passing object missing required key throws CheckError`, () => {
    expect(() =>
      isPerson({
        firstName: "John",
        surname: "Doe",
      })
    ).toThrowErrorMatchingSnapshot();
  });

  test(`passing object with wrong property in req throws error`, () => {
    const isPerson = isObjectWithShape(
      { req: { firstName: isString } },
      { name: "isPerson" }
    );
    expect(() => isPerson({ firstName: 5 })).toThrowErrorMatchingSnapshot();
  });

  test(`passing object with wrong property in opt throws error`, () => {
    const isPerson = isObjectWithShape(
      { req: { firstName: isString }, opt: { dateOfBirth: isInteger } },
      { name: "isPerson" }
    );

    expect(() =>
      isPerson({ firstName: "Jane", dateOfBirth: 199.5 })
    ).toThrowErrorMatchingSnapshot();
  });

  test(`passing object with nested wrong property in req throws error`, () => {
    const isName = isObjectWithShape(
      {
        req: {
          firstName: isString,
          surname: isString,
        },
      },
      { name: "isName" }
    );
    const isPerson = isObjectWithShape(
      {
        req: {
          name: isName,
        },
      },
      { name: "isPerson" }
    );

    expect(() =>
      isPerson({ name: { firstName: "John", surname: 5 } })
    ).toThrowErrorMatchingSnapshot();
  });

  test(`passing object with nested missing property in req throws error`, () => {
    const isName = isObjectWithShape(
      {
        req: {
          firstName: isString,
          surname: isString,
        },
      },
      { name: "isName" }
    );
    const isPerson = isObjectWithShape(
      {
        req: {
          name: isName,
        },
      },
      { name: "isPerson" }
    );

    expect(() =>
      isPerson({ name: { firstName: "John" } })
    ).toThrowErrorMatchingSnapshot();
  });

  test(`passing object with nested wrong property in opt throws error`, () => {
    const isName = isObjectWithShape(
      {
        req: {
          firstName: isString,
          surname: isString,
        },
        opt: {
          title: isString,
        },
      },
      { name: "isName" }
    );
    const isPerson = isObjectWithShape(
      {
        req: {
          name: isName,
        },
      },
      { name: "isPerson" }
    );

    expect(() =>
      isPerson({ name: { firstName: "John", surname: "Smith", title: false } })
    ).toThrowErrorMatchingSnapshot();
  });
});
