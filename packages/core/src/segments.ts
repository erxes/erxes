export default {
  indexesTypeContentType: {
    'core:user': 'users'
  },

  contentTypes: ['user'],

  descriptionMap: {
    user: 'Team member'
  },

  associationTypesAvailable: true,

  associationTypes: async () => {
    const types: string[] = ['core:user'];

    return { data: types, status: 'success' };
  }
};
