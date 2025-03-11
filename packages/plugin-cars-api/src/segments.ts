import * as _ from 'underscore';

export default {
  contentTypes: [{ type: 'car', description: 'Car', esIndex: 'cars' }],

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
