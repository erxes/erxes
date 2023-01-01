export default {
  contentTypes: [
    { type: 'posOrder', description: 'Pos order', esIndex: 'pos_orders' }
  ],

  esTypesMap: async () => {
    return { data: { typesMap: {} }, status: 'success' };
  }
};
