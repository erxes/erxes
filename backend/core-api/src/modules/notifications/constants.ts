export const CORE_NOTIFICATION_MODULES = [
  {
    pluginName: 'core',
    modules: [
      {
        name: 'structure',
        description: 'Structure',
        icon: 'IconBuilding',
        events: [
          {
            name: 'structureAssignment',
            title: 'Structure membership changed',
            description:
              'Triggered when you are added to or removed from a structure node',
          },
          {
            name: 'structureSeatAssignment',
            title: 'Seat changed',
            description: 'Triggered when you receive or lose a seat',
          },
        ],
      },
    ],
  },
];

export const PRIORITY_ORDER = { low: 1, medium: 2, high: 3, urgent: 4 };
