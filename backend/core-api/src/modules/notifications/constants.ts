export const CORE_NOTIFICATION_MODULES = [
  {
    pluginName: 'core',
    modules: [
      {
        name: 'structure',
        description: 'Structure',
        icon: 'IconBuilding',
        types: [
          { name: 'branchAssigneeChanged', text: 'Branch assignee changed' },
          {
            name: 'departmentAssigneeChanged',
            text: 'Department assignee changed',
          },
        ],
      },
    ],
  },
];

export const PRIORITY_ORDER = { low: 1, medium: 2, high: 3, urgent: 4 };
