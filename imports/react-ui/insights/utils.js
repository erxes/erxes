export function selectOptions(array) {
  const options = [];
  array.map(item => options.push({ value: item._id, label: item.name }));
  return options;
}

export function integrationOptions(array) {
  const options = [];
  array.map(item => options.push({ value: item, label: item }));
  return options;
}
