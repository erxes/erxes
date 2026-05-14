export const salesSegmentConfigs = {
  dependentModules: [
    {
      name: 'core',
      types: ['company', 'customer', 'lead'],
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
      type: 'deal',
      description: 'Deal',
      esIndex: 'deals',
    },
  ],
};
