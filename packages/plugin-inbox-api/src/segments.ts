export default {
  indexesTypeContentType: {
    'inbox:conversation': 'conversations'
  },

  contentTypes: ['conversation'],

  descriptionMap: {
    deal: 'Deal',
    ticket: 'Ticket',
    task: 'Task',
    customer: 'Customer',
    company: 'Company',
    conversation: 'Conversation'
  },

  associationTypes: [
    'inbox:conversation',
    'cards:deal',
    'contacts:customer',
    'contacts:company',
    'cards:ticket',
    'cards:task'
  ],

  esTypesMap: async () => {
    return { data: { typesMap: {} }, status: 'success' };
  }
};
