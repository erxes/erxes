export const generateTree = (
  list,
  parentId,
  callback,
  level = -1,
  parentKey = 'parentId'
) => {
  const filtered = list.filter(
    c =>
      c[parentKey] === parentId ||
      (parentId === null && (!c[parentKey] || c[parentKey] === c._id))
  );

  if (filtered.length > 0) {
    level++;
  } else {
    level--;
  }

  return filtered.reduce((tree, node) => {
    return [
      ...tree,
      callback(node, level),
      ...generateTree(list, node._id, callback, level, parentKey)
    ];
  }, []);
};
