// Create an array with "stop" numbers, starting from "start"
const range = (start, stop) => {
  return Array.from(Array(stop), (_, i) => start + i);
};

// Return the list of values that are the intersection of two arrays
const intersection = (array1, array2) => {
  return array1.filter(n => array2.includes(n));
};

export { range, intersection };
