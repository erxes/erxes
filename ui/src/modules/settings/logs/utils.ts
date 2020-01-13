/**
 * Shorthand empty object checker
 * @param {Object} obj Object to check
 */
export const isObjectEmpty = (obj = {}): boolean => {
  return (
    typeof obj === 'object' &&
    obj &&
    Object.keys(obj).length === 0 &&
    obj.constructor === Object
  );
};

/**
 * Removes null, undefined, empty attributes from given object
 * @param {Object} obj Object to check
 * @returns {Object} Flattened object
 */
export const flattenObject = (obj = {}): object => {
  const flatObject = { ...obj };
  const names = obj ? Object.getOwnPropertyNames(obj) : [];

  for (const name of names) {
    const field = obj[name];
    let empty = false;

    if (typeof field !== 'object') {
      if (field === null || field === undefined || field === '') {
        empty = true;
      }
    }

    if (Array.isArray(field) && field.length === 0) {
      empty = true;
    }

    // checked array above
    if (typeof field === 'object' && !Array.isArray(field)) {
      if (isObjectEmpty(field)) {
        empty = true;
      }
    }

    if (empty) {
      delete flatObject[name];
    }
  } // end for loop

  return flatObject;
};
