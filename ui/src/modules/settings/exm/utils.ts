export const removeTypename = (obj?: any[] | any) => {
  if (Array.isArray(obj)) {
    return obj.map(item => {
      delete item.__typename;

      return item;
    });
  }

  delete obj.__typename;

  return obj;
};
