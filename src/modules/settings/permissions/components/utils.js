export const generateModuleParams = lists => {
  return lists.map(item => ({
    value: item.name,
    label: item.description
  }));
};

export const generateUsersParams = users => {
  return users.map(user => ({
    value: user._id,
    label: user.email
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
