export const salesSegmentConfigs = {
  dependentModules: [
    {
      name: 'core',
      types: ['companies', 'customers', 'leads'],
      twoWay: true,
      associated: true,
    },
    {
      name: 'frontline',
      type: ['conversation', 'ticket'],
      twoWay: true,
      associated: true,
    },
    { name: 'operation', type: ['task'], twoWay: true, associated: true },
    {
      name: 'cars',
      twoWay: true,
      associated: true,
    },
  ],

  contentTypes: [
    {
      moduleName: 'sales',
      type: 'deals',
      description: 'Deal',
      esIndex: 'deals',
    },
  ],
};
