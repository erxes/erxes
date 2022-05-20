const syncOrders = `
  mutation syncOrders {
    syncOrders
  }
`;

const deleteOrders = `
  mutation deleteOrders {
    deleteOrders
  }
`;

const syncConfig = `
  mutation syncConfig($type: String!) {
    syncConfig(type: $type)
  }
`;

export default { syncConfig, syncOrders, deleteOrders };
