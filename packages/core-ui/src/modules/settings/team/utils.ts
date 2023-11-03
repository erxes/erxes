export const generateTree = (
  list,
  parentId,
  callback,
  level = -1,
  parentKey = 'parentId'
) => {
  const filtered = list.filter(
    (c: any) => c[parentKey] === parentId || c[parentKey] === null
  );
  console.log('aaaa', filtered);
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
