export const compareArrays = (arr1, arr2) => {
  const addedItems = arr2.filter(item => !arr1.includes(item));
  const removedItems = arr1.filter(item => !arr2.includes(item));

  if (addedItems.length === 0 && removedItems.length === 0) {
    return null;
  } else {
    return {
      added: addedItems,
      removed: removedItems
    };
  }
};
