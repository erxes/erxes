// Create an array with "stop" numbers, starting from "start"
const range = (start, stop) => {
  return Array.from(Array(stop), (_, i) => start + i);
};

// Return the list of values that are the intersection of two arrays
const intersection = (array1, array2) => {
  return array1.filter(n => array2.includes(n));
};

// Computes the union of the passed-in arrays: the list of unique items
const union = (array1, array2) => {
  return array1.concat(array2.filter(n => !array1.includes(n)));
};

// Similar to without, but returns the values from array that are not present in the other arrays.
const difference = (array1, array2) => {
  return array1.filter(n => !array2.includes(n));
};

export { range, intersection, union, difference };
