import isEqual from "lodash.isequal";

export class CheckError {
  constructor({ name, value, path }) {
    this.name = name;
    this.value = value;
    this.path = path;
  }
}

export const checkFromPredicate = (name, predicate) => value => {
  let passed, reason;
  try {
    passed = predicate(value);
  } catch (error) {
    passed = false;
    reason = error;
  }
  if (passed) {
    return value;
  }

  const path =
    reason && reason instanceof CheckError ? [name, ...reason.path] : [name];

  const error = new CheckError({
    name,
    value,
    path,
  });

  throw error;
};

export const isNumber = checkFromPredicate(
  "isNumber",
  x => typeof x === "number"
);

export const isInteger = checkFromPredicate("isInteger", x =>
  Number.isInteger(x)
);

export const isString = checkFromPredicate(
  "isString",
  x => typeof x === "string"
);

export const isBool = checkFromPredicate("isBool", x => typeof x === "boolean");

export const isVal = val =>
  checkFromPredicate(`isVal(${JSON.stringify(val)})`, x => isEqual(x, val));

export const isInstanceOf = constructor => x => x instanceof constructor;

export const and = (...predicates) => (...args) => {
  return predicates.every(fn => fn(...args));
};

export const or = (...predicates) => (...args) => {
  const passed = predicates.some(predicate => {
    try {
      predicate(...args);
    } catch (_) {
      return false;
    }
    return true;
  });
};

export const isObjectWithShape = shape => object => {
  if (typeof object !== "object") {
    throw new Error();
  }
  const { req, opt } = shape;
  for (const key in req) {
    const testFn = req[key];
    const value = object[key];
    const passed = testFn(value);
    if (!passed) {
      throw new Error();
    }
  }
  for (const key in opt) {
    const hasProperty = object.hasOwnProperty(key);
    if (hasProperty) {
      const testFn = req[key];
      const value = object[key];
      const passed = testFn(value);
      if (!passed) {
        throw new Error();
      }
    }
  }

  return object;
};

// ProjectRecord
// isObjectWithShape({
//   req: {
//     _id: string,
//     schema_version: string,
//     name: string,
//     description: string,
//     dateCreated: instanceOf(Date),
//     archived: isBool,
//     html: isInstanceOf(FileRecord),
//     javascript: isInstanceOf(FileRecord),
//     css: isInstanceOf(FileRecord),
//   },
//   opt: {
//     _rev: string,
//   },
// });
