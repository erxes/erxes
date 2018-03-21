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

export function collectOrders(list) {
  const updatedList = [];

  list.forEach((element, index) => {
    updatedList.push({
      _id: element._id,
      order: index
    });
  });

  return updatedList;
}

export function listObjectUnFreeze(source) {
  const target = [];

  if (source) {
    source.forEach(element => {
      const targetElement = {};

      for (const property in element) {
        if (element.hasOwnProperty(property)) {
          targetElement[property] = element[property];
        }
      }

      target.push(targetElement);
    });
  }

  return target;
}
