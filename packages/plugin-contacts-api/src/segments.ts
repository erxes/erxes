export default {
  indexesTypeContentType: {
    'contacts:customer': 'customers',
    'contacts:company': 'companies'
  },

  contentTypes: ['customer', 'company'],

  descriptionMap: {
    deal: 'Deal',
    ticket: 'Ticket',
    task: 'Task',
    customer: 'Customer',
    company: 'Company'
  },

  associationTypes: async () => {
    const types: string[] = [
      'contacts:customer',
      'contacts:company',
      'cards:deal',
      'cards:ticket',
      'cards:task',
      'inbox:conversation'
    ];

    return { data: types, status: 'success' };
  },

  esTypesMap: async () => {
    return { data: { typesMap: {} }, status: 'success' };
  },

  initialSelector: async ({ segment, options }) => {
    const negative = {
      term: {
        status: 'deleted'
      }
    };

    return { data: { negative }, status: 'success' };
  }
};
