const whatsappUpdateConfigs = `
  mutation whatsappUpdateConfigs($configsMap: JSON!) {
    whatsappUpdateConfigs(configsMap: $configsMap)
  }
`;

const whatsappRepair = `
  mutation whatsappRepair($_id: String!) {
    whatsappRepair(_id: $_id)
  }
`;

export default {
  whatsappUpdateConfigs,
  whatsappRepair
};
