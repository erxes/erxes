export const ticketsSegmentConfigs = {
  dependentModules: [
    {
      name: 'core',
      types: ['companies', 'customers', 'leads'],
      twoWay: true,
      associated: true,
    },
    { name: 'operation', type: ['tasks'], twoWay: true, associated: true },
  ],

  contentTypes: [
    {
      moduleName: 'tickets',
      type: 'tickets',
      description: 'Ticket',
      esIndex: 'tickets',
    },
  ],
};
