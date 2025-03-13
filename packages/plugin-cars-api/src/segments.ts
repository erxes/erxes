import * as _ from 'underscore';

export default {
  dependentServices: [
    { name: 'contacts', twoWay: true, associated: true },
    { name: 'core', twoWay: true, associated: true },
    { name: 'sales', twoWay: true, associated: true },
  ],

  contentTypes: [{ type: 'car', description: 'Car', esIndex: 'cars' }],

  esTypesMap: async () => {
    return { data: { typesMap: {} }, status: 'success' };
  },

  initialSelector: async () => {
    const negative = {
      term: {
        status: 'deleted',
      },
    };

    return { data: { negative }, status: 'success' };
  },
};
