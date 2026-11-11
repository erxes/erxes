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
            description: 'Triggered when the assignee of a position is changed',
          },
        ],
      },
      {
        name: 'security',
        description: 'Security',
        icon: 'IconShieldLock',
        events: [
          {
            name: 'supportAccessRequested',
            title: 'Support access requested',
            description:
              'Triggered when erxes support asks to enter the workspace',
          },
          {
            name: 'supportAccessEntered',
            title: 'Support entered the workspace',
            description: 'Triggered when erxes support enters the workspace',
          },
        ],
      },
    ],
  },
];

export const PRIORITY_ORDER = { low: 1, medium: 2, high: 3, urgent: 4 };
