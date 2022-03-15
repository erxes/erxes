export default {
  indexesTypeContentType: {
    'inbox:conversation': 'conversations'
  },

  contentTypes: ['conversation'],

  descriptionMap: {
    conversation: 'Converstaion'
  },

  associationTypes: async ({}) => {
    const types: string[] = [
      'inbox:conversation',
      'cards:deal',
      'contacts:customer',
      'contacts:company',
      'cards:ticket',
      'cards:task'
    ];

    return { data: types, status: 'success' };
  },

  esTypesMap: async () => {
    return { data: { typesMap: {} }, status: 'success' };
  }
};
