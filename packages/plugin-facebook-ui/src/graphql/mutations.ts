const facebookUpdateConfigs = `
  mutation facebookUpdateConfigs($configsMap: JSON!) {
    facebookUpdateConfigs(configsMap: $configsMap)
  }
`;

const facebookRepair = `
  mutation facebookRepair($_id: String!) {
    facebookRepair(_id: $_id)
  }
`;

export default {
  facebookUpdateConfigs,
  facebookRepair
};
