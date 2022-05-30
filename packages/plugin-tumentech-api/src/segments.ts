export default {
  indexesTypeContentType: {
    'tumentech:car': 'cars'
  },

  contentTypes: ['car'],

  descriptionMap: {
    car: 'Car',
    customer: 'Customer'
  },

  associationTypes: ['tumentech:car', 'contacts:customer'],

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
      };
    }

    return { data: { negative, positive }, status: 'success' };
  }
};
