export default {
  indexesTypeContentType: {
    'contacts:lead': 'customers',
    'contacts:customer': 'customers',
    'contacts:company': 'companies'
  },

  contentTypes: ['lead', 'customer', 'company'],

  descriptionMap: {
    deal: 'Deal',
    ticket: 'Ticket',
    task: 'Task',
    lead: 'Lead',
    customer: 'Customer',
    company: 'Company',
    converstaion: 'Conversation'
  },

  associationTypes: async () => {
    const types: string[] = [
      'contacts:lead',
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

  initialSelector: async ({ data: { segment } }) => {
    const negative = {
      term: {
        status: 'deleted'
      }
    };

    const { contentType } = segment;

    let positive;

    if (contentType.includes('customer') || contentType.includes('lead')) {
      positive = {
        term: {
          state: segment.contentType.replace('contacts:', '')
        }
      }
    }

    return { data: { negative, positive }, status: 'success' };
  }
};
