import { debugBase } from './debuggers';
import Logs from './models/Logs';

/**
 * Takes 2 arrays and detect changes between them.
 * @param oldArray Old array
 * @param newArray New array
 * @returns Object specifying changed & unchanged fields
 * @todo Improve object array comparison part
 */
const compareArrays = (oldArray: any[] = [], newArray: any[] = []) => {
  const changedItems = [];
  const unchangedItems = [];
  const addedItems = [];
  let removedItems = [];

  if (oldArray.length > 0 && newArray.length === 0) {
    removedItems = oldArray;
  }

  for (const elem of oldArray) {
    if (typeof elem !== 'object') {
      const found = newArray.find(el => el === elem);

      /**
       * If removedItems contains the pushing value, then it caused the following error
       * FATAL ERROR: CALL_AND_RETRY_LAST Allocation failed - JavaScript heap out of memory
       */
      if (!found && elem && !removedItems.includes(elem)) {
        removedItems.push(elem);
      }
    }
  }

  newArray.forEach((elem, index) => {
    // primary data types
    if (typeof elem !== 'object') {
      const found = oldArray.find(el => el === elem);

      if (found) {
        unchangedItems.push(elem);
      }

      // means an element has been added
      if (!found && elem) {
        addedItems.push(elem);
      }
    }

    if (typeof elem === 'object') {
      const comparison = compareObjects(oldArray[index], newArray[index]);
      const { unchanged, changed, added, removed } = comparison;

      if (changed && !isObjectEmpty(changed)) {
        changedItems.push(changed);
      }

      if (added && !isObjectEmpty(added)) {
        addedItems.push(added);
      }

      if (removed && !isObjectEmpty(removed)) {
        removedItems.push(removed);
      }

      if (unchanged && !isObjectEmpty(unchanged)) {
        unchangedItems.push(unchanged);
      }
    }
  });

  return {
    unchanged: unchangedItems,
    changed: changedItems,
    added: addedItems,
    removed: removedItems,
  };
};

/**
 * Shorthand empty value checker
 * @param val Value to check
 */
const isNull = val => val === null || val === undefined || val === '';

/**
 * Shorthand empty object checker
 * @param obj Object to check
 */
const isObjectEmpty = obj => {
  return typeof obj === 'object' && obj && Object.keys(obj).length === 0 && obj.constructor === Object;
};

/**
 * Removes null, undefined attributes from given object one level down.
 * @param {Object} obj Object to check
 * @returns {Object} Flattened object
 */
const flattenObject = (obj = {}) => {
  const flatObject = { ...obj };
  const names = obj ? Object.getOwnPropertyNames(obj) : [];

  for (const name of names) {
    const attr = obj[name];
    let empty = false;

    if (typeof attr !== 'object') {
      if (isNull(attr)) {
        empty = true;
      }
    }

    if (Array.isArray(attr) && attr.length === 0) {
      empty = true;
    }

    if (typeof attr === 'object' && !Array.isArray(attr)) {
      if (isObjectEmpty(attr)) {
        empty = true;
      }
    }

    if (empty) {
      delete flatObject[name];
    }
  } // end for loop

  return flatObject;
};

/**
 * Detects changes between two objects.
 * Input objects MUST have same hierarchical level of attributes.
 * @param oldData Actual data in db
 * @param newData Doc to be changed
 * @returns Object specifying changed & unchanged fields
 */
export const compareObjects = (oldData: object = {}, newData: object = {}) => {
  const changedFields = {};
  const unchangedFields = {};
  const addedFields = {};
  const removedFields = {};
  // exclude field names not stored in db
  const nonSchemaNames = ['uid', 'length'];
  let fieldNames: string[] = [];

  if (newData && !isObjectEmpty(newData)) {
    fieldNames = Object.getOwnPropertyNames(newData);
    // split
    fieldNames = fieldNames.map<string>(n => {
      if (!nonSchemaNames.includes(n)) {
        return n;
      }
    });
  }

  for (const name of fieldNames) {
    const oldField = oldData[name];
    const newField = newData[name];

    if (typeof newField !== 'object') {
      // changed fields
      if (oldField !== newField) {
        changedFields[name] = newField;

        // means removed a field
        if (!isNull(oldField) && isNull(newField)) {
          removedFields[name] = oldField;
        }

        // means added a new field
        if (isNull(oldField) && !isNull(newField)) {
          addedFields[name] = newField;
        }
      }

      // unchanged fields
      if (oldField === newField) {
        unchangedFields[name] = newField;
      }
    } // end primary type comparison

    if (Array.isArray(newField)) {
      const comparison = compareArrays(oldField, newField);
      const { changed, unchanged, added, removed } = comparison;

      if (changed.length > 0) {
        changedFields[name] = changed;
      }
      if (added.length > 0) {
        addedFields[name] = added;
      }
      if (removed.length > 0) {
        removedFields[name] = removed;
      }
      if (unchanged.length > 0) {
        unchangedFields[name] = unchanged;
      }
    } // end array comparison

    if (typeof newField === 'object' && !Array.isArray(newField)) {
      // compare deeply when only both fields have values
      if (newField && oldField) {
        const comparison = compareObjects(oldField, newField);
        const { changed, added, removed, unchanged } = comparison;

        if (!isObjectEmpty(changed)) {
          changedFields[name] = flattenObject(changed);
        }
        if (!isObjectEmpty(added)) {
          addedFields[name] = flattenObject(added);
        }
        if (!isObjectEmpty(removed)) {
          removedFields[name] = flattenObject(removed);
        }
        if (!isObjectEmpty(unchanged)) {
          unchangedFields[name] = flattenObject(unchanged);
        }
      } // end both field checking

      if (!oldField && newField) {
        addedFields[name] = newField;
      }

      if (oldField && !newField) {
        removedFields[name] = oldField;
      }
    } // end regular object comparison
  } // end old data for loop

  return {
    changed: changedFields,
    unchanged: unchangedFields,
    added: addedFields,
    removed: removedFields,
  };
};

export const receivePutLogCommand = async params => {
  debugBase(params);

  const { createdBy, type, action, unicode, description, object, newData, extraDesc } = params;

  return Logs.createLog({
    createdBy,
    type,
    action,
    object,
    newData,
    unicode,
    createdAt: new Date(),
    description,
    extraDesc,
  });
};
