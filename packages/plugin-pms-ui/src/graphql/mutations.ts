// Settings

const updateConfigs = `
  mutation pmsConfigsUpdate($configsMap: JSON!) {
    pmsConfigsUpdate(configsMap: $configsMap)
  }
`;

export default {
  updateConfigs,
};
