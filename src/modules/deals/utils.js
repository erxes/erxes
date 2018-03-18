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
