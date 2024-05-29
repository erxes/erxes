const zaloUpdateConfigs = `
  mutation zaloUpdateConfigs($configsMap: JSON!) {
    zaloUpdateConfigs(configsMap: $configsMap)
  }
`;

const removeAccount = `
  mutation zaloRemoveAccount($_id: String!) {
    zaloRemoveAccount(_id: $_id)
  }
`;

export default {
  zaloUpdateConfigs,
  removeAccount
};
