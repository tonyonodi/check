import isEqual from "lodash.isequal";

export class CheckError {
  constructor({ value, path, reason }) {
    this.value = value; // not sure if we need this
    this.path = path;
    this.reason = reason;
  }

  get message() {
    const { path, reason } = this;
    const pathEnd = path[0];
    const printedPath = path.join("\n\t");

    return `CheckError: check "${pathEnd}" ${reason} at:\n\t${printedPath}`;
  }
}

const print = value => {
  switch (typeof value) {
    case "object":
      return JSON.stringify(value);
    case "string":
      return `"${value}"`;
    default:
      return value;
  }
};

export const isNumber = value => {
  const passed = typeof value === "number";
  if (!passed) {
    throw new CheckError({
      value,
      path: ["isNumber"],
      reason: `expected a number but received \n\n\t${print(value)}\n\n`,
    });
  } else {
    return value;
  }
};

export const isInteger = value => {
  const passed = Number.isInteger(value);
  if (!passed) {
    throw new CheckError({
      value,
      path: ["isInteger"],
      reason: `expected an integer but received \n\n\t${print(value)}\n\n`,
    });
  } else {
    return value;
  }
};

export const isString = value => {
  const passed = typeof value === "string";
  if (!passed) {
    throw new CheckError({
      value,
      path: ["isString"],
      reason: `expected a string but received \n\n\t${print(value)}\n\n`,
    });
  } else {
    return value;
  }
};

export const isBool = value => {
  const passed = typeof value === "boolean";
  if (!passed) {
    throw new CheckError({
      value,
      path: ["isBool"],
      reason: `expected a boolean but received \n\n\t${print(value)}\n\n`,
    });
  } else {
    return value;
  }
};

export const isArray = value => {
  const passed = Array.isArray(value);
  if (!passed) {
    throw new CheckError({
      value,
      path: ["isArray"],
      reason: `expected an array but received \n\n\t${print(value)}\n\n`,
    });
  } else {
    return value;
  }
};

const isValReason = (expected, value) => {
  return `expected value

  ${print(expected)}
  
but received

  ${print(value)}
  
`;
};

export const isVal = expected => value => {
  const passed = isEqual(value, expected);
  if (!passed) {
    const reason = isValReason(expected, value);
    throw new CheckError({
      value,
      path: [`isVal(${expected})`],
      reason,
    });
  } else {
    return value;
  }
};

export const isArrayOf = (check, options) => value => {
  const name =
    typeof (options && options.name) === "string" ? options.name : "isArrayOf";

  if (!Array.isArray(value)) {
    throw new CheckError({
      value,
      path: [name],
      reason: `expected an array but received ${print(value)}`,
    });
  }

  const checkElement = (element, i) => {
    try {
      check(element);
    } catch (error) {
      throw new CheckError({
        value: element,
        path: [...error.path, `${name}[${i}]`],
        reason: error.reason,
      });
    }
  };

  value.forEach(checkElement);
  return value;
};

export const isInstanceOf = constructor => {
  try {
    new constructor();
  } catch (error) {
    if (/ is not a constructor$/.test(error.message)) {
      const restLength = " is not a constructor".length;
      const valueLength = error.message.length - restLength;
      const valueName = error.message.substr(0, valueLength);
      throw new Error(
        "TypeError",
        `couldn't create isInstanceOf because ${valueName} is not a constructor`
      );
    } else {
      throw error;
    }
  }

  return value => {
    const passed = value instanceof constructor;
    if (!passed) {
      const constructorName =
        constructor && constructor.name ? constructor.name : "unknown";
      new CheckError({
        value,
        path: [`isInstanceOf(${constructorName})`],
        reason,
      });
    } else {
      return value;
    }
  };
};

export const isObjectWithShape = (shape, options) => {
  if (typeof shape !== "object") {
    throw new Error("TypeError", "isObjectWithShape expects an object");
  }

  if (shape.req && typeof shape.req !== "object") {
    throw new Error(
      "TypeError",
      `isObjectWithShape expects property "req" of first argument to be an object`
    );
  }
  if (shape.opt && typeof shape.opt !== "object") {
    throw new Error(
      "TypeError",
      `isObjectWithShape expects property "opt" of first argument to be an object`
    );
  }
  if (!shape.req && !shape.opt) {
    throw new Error(
      "TypeError",
      `isObjectWithShape expects an object with at least one of the following properties: "opt" or "req"`
    );
  }

  return object => {
    const name =
      typeof (options && options.name) === "string"
        ? options.name
        : "isObjectWithShape";
    if (typeof object !== "object") {
      throw new CheckError({
        name,
        value: object,
        path: [name],
      });
    }

    const testProperty = (propertyName, propertyValue, propertyCheck) => {
      try {
        propertyCheck(propertyValue);
      } catch (error) {
        const path =
          error instanceof CheckError
            ? [...error.path, `${name}.${propertyName}`]
            : [`${name}.${propertyName}`];

        const reason = error.reason
          ? error.reason
          : `threw the error \n\n${error.name}:${
              error.message
            }\n\nwhen checking the value of ${propertyName}`;

        throw new CheckError({
          value: propertyValue,
          path,
          reason,
        });
      }
    };

    const testReqOrOpt = (shape, isRequired) => {
      for (const key in shape) {
        const hasProperty = object.hasOwnProperty(key);
        if (!hasProperty && isRequired) {
          throw new CheckError({
            path: [`${name}.${key}`],
            reason: `expected a property "${key}"`,
          });
        }
        if (hasProperty) {
          testProperty(key, object[key], shape[key]);
        }
      }
    };

    const { req, opt } = shape;
    if (req) {
      testReqOrOpt(req, true);
    }
    if (opt) {
      testReqOrOpt(opt, false);
    }

    return object;
  };
};

// export const and = (...predicates) => (...args) => {
//   return predicates.every(fn => fn(...args));
// };

// export const or = (...predicates) => (...args) => {
//   const passed = predicates.some(predicate => {
//     try {
//       predicate(...args);
//     } catch (_) {
//       return false;
//     }
//     return true;
//   });
// };
