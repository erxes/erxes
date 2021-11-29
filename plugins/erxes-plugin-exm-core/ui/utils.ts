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

export const generateTree = (
  list,
  parentId,
  callback,
  parentKey = 'parentId'
) => {
  return list
    .filter(c => c[parentKey] === parentId)
    .reduce(
      (tree, node) => [
        ...tree,
        callback(node),
        ...generateTree(list, node._id, callback, parentKey)
      ],
      []
    );
};
