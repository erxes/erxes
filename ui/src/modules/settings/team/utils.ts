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
