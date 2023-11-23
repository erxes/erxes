const instagramUpdateConfigs = `
  mutation instagramUpdateConfigs($configsMap: JSON!) {
    instagramUpdateConfigs(configsMap: $configsMap)
  }
`;

const instagramRepair = `
  mutation instagramRepair($_id: String!) {
    instagramRepair(_id: $_id)
  }
`;

export default {
  instagramUpdateConfigs,
  instagramRepair
};
