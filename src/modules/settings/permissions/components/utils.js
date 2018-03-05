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
