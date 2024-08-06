export const generateOptions = (array) => {
  return array.map((item) => ({
    value: item._id,
    label: item.name || item.title
  }));
};

export const includesAny = (array1: string[], array2: string[] | string) => {
  if (Array.isArray(array2)) {
    return array2.some((item) => array1.includes(item));
  }

  return array1.includes(array2);
};
