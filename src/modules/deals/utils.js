// get options for react-select-plus
export function selectOptions(array) {
  return array.map(item => ({ value: item._id, label: item.name }));
}

// get config options for react-select-plus
export function selectConfigOptions(array, CONSTANT) {
  return array.map(item => ({
    value: item,
    label: CONSTANT.find(el => el.value === item).label
  }));
}

// get user options for react-select-plus
export function selectUserOptions(array) {
  return array.map(item => ({
    value: item._id,
    label: item.details.fullName || item.email
  }));
}

export function collectOrders(array) {
  return array.map((item, index) => ({
    _id: item._id,
    order: index
  }));
}
