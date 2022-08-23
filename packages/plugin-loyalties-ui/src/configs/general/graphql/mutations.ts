// Settings

const updateLoyaltyConfigs = `
  mutation loyaltyConfigsUpdate($configsMap: JSON!) {
    loyaltyConfigsUpdate(configsMap: $configsMap)
  }
`;

export default {
  updateLoyaltyConfigs
};
