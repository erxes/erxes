import * as _ from 'underscore';

export default {
  contentTypes: [
    { type: 'product', description: 'Product', esIndex: 'products' }
  ],

  esTypesMap: async () => {
    return { data: { typesMap: {} }, status: 'success' };
  },

  initialSelector: async () => {
    const negative = {
      term: {
        status: 'deleted'
      }
    };

    return { data: { negative }, status: 'success' };
  }
};
