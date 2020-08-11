const updateConfigs = `
  mutation configsUpdate($configsMap: JSON!) {
    configsUpdate(configsMap: $configsMap)
  }
`;

export default { updateConfigs };
