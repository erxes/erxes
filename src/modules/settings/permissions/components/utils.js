export const generateModuleParams = lists => {
  return lists.map(item => ({
    value: item.name,
    label: item.description
  }));
};

export const generateListParams = items => {
  return items.map(item => ({
    value: item._id,
    label: item.email || item.name
  }));
};

export const correctValue = data => {
  return data ? data.value : '';
};

export const filterActions = (actions, moduleName) => {
  if (!moduleName) return [];

  const moduleActions = actions.filter(a => a.module === moduleName);

  return generateModuleParams(moduleActions);
};
