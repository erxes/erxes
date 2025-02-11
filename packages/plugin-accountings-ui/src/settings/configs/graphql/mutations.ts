const updateConfigs = `
  mutation accountingsConfigsUpdate($configsMap: JSON!) {
    accountingsConfigsUpdate(configsMap: $configsMap)
  }
`;

export default {
  updateConfigs,
};
