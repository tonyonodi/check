# JS-Check

A package for checking that data matches the criteria you expect it to.

## Predicate

In Cheque a predicate is a pure function that takes in a value and returns true or false depending on whether or not the value passed the predicate's test.

For Example

```javascript
const isGreaterThan5Pred = x => typeof x === "number" && x > 5;
```

## Check

A check can be created with the function `checkFromPredicate`. This function takes in a name and a predicate and returns a check function. For Example:

```javascript
import { checkFromPredicate } from "cheque";

const isGreaterThan5Pred = x => typeof x === "number" && x > 5;

const isGreaterThan5 = checkFromPredicate(
  "isGreaterThan5",
  isGreaterThan5Pred
);
```

In the above example `isGreaterThan5` takes one argument and passes it to the predicate `isGreaterThan5Pred`. If the predicate returns true then the check will just return the value; if it returns false it will throw a CheckError giving the name of the check that was failed and the value that failed.

```javascript
isGreaterThan5(10) // 10
isGreaterThan5(1) // CheckError { name: "isGreaterThan5", value: 1 }
```

