// Move in list
export function moveInList(array = [], startIndex, endIndex) {
  const [removedItem] = array.splice(startIndex, 1);
  array.splice(endIndex, 0, removedItem);

  return array;
}

// Remove from list
export function removeFromList(array = [], index) {
  const [removedItem] = array.splice(index, 1);
  return { sourceList: array, removedItem };
}

// Add to list
export function addToList(array = [], index, item) {
  array.splice(index, 0, item);
  return array;
}

// get options for react-select-plus
export function selectOptions(array) {
  const options = [];
  array.map(item => options.push({ value: item._id, label: item.name }));
  return options;
}

// get config options for react-select-plus
export function selectConfigOptions(array, CONSTANT) {
  const options = [];
  array.map(item =>
    options.push({
      value: item,
      label: CONSTANT.find(el => el.value === item).label
    })
  );
  return options;
}

// get user options for react-select-plus
export function selectUserOptions(array) {
  const options = [];
  array.map(item =>
    options.push({
      value: item._id,
      label: item.details.fullName || item.email
    })
  );
  return options;
}
