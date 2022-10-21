export default {
  dependentServices: [{ name: 'contacts', twoWay: true }],

  contentTypes: [
    {
      type: 'conversation',
      description: 'Conversation',
      esIndex: 'conversations'
    }
  ],

  esTypesMap: async () => {
    return { data: { typesMap: {} }, status: 'success' };
  }
};
