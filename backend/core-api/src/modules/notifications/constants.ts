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
            name: 'branchAssigneeChanged',
            title: 'Branch assignee changed',
            description: 'Triggered when the assignee of a branch is changed',
          },
          {
            name: 'departmentAssigneeChanged',
            title: 'Department assignee changed',
            description:
              'Triggered when the assignee of a department is changed',
          },
          {
            name: 'positionAssigneeChanged',
            title: 'Position assignee changed',
            description:
              'Triggered when the assignee of a position is changed',
          },
        ],
      },
    ],
  },
];

export const PRIORITY_ORDER = { low: 1, medium: 2, high: 3, urgent: 4 };
