import * as _ from 'underscore';

export default {
  contentTypes: [
    { type: 'account', description: 'Account', esIndex: 'accounts' }
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
