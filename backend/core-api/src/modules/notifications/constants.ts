export const CORE_NOTIFICATION_MODULES = [
  {
    pluginName: 'core',
    modules: [
      {
        name: 'structure',
        description: 'Structure management',
        icon: 'IconBuilding',
        events: [
          {
            title: 'Branch assignee changed',
            name: 'branchAssigneeChanged',
            description: 'Branch assignee changed',
          },
          {
            title: 'Department assignee changed',
            name: 'departmentAssigneeChanged',
            description: 'Department assignee changed',
          },
        ],
      },
    ],
  },
];

export const PRIORITY_ORDER = { low: 1, medium: 2, high: 3, urgent: 4 };
