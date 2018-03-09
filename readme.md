# Check

A package for dynamically checking that data matches the criteria you expect it to.

## Predicate

In Check a predicate is a pure function that takes in a value and returns true or false depending on whether or not the value passed the predicate's test.

For Example

```javascript
const isGreaterThan5Pred = x => typeof x === "number" && x > 5;
```

## Check

A Check, takes in a single value, tests it against one or more predicates and returns the value if all predicates return true or throws a CheckError if any return false.