export default {
  contentTypes: [{ type: 'car', description: 'Car', esIndex: 'cars' }],

  dependentServices: [{ name: 'contacts', twoWay: true, associated: true }],

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
