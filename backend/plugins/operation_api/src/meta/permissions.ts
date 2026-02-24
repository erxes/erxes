import { IPermissionConfig } from 'erxes-api-shared/core-types';

export const permissions: IPermissionConfig = {
  plugin: 'operation',

  modules: [
    {
      name: 'task',
      description: 'Task management',
      scopeField: 'teamId',
      ownerFields: ['createdBy', 'assignedTo'],

      scopes: [
        {
          name: 'own',
          description: 'Records user created or assigned to user',
        },
        {
          name: 'group',
          description: 'Records in user teams',
        },
        { name: 'all', description: 'All records' },
      ],

      actions: [
        {
          title: 'View tasks records',
          name: 'taskRead',
          description: 'View tasks',
          always: true,
        },
        {
          title: 'Create tasks records',
          name: 'taskCreate',
          description: 'Create tasks',
        },
        {
          title: 'Edit tasks records',
          name: 'taskUpdate',
          description: 'Edit tasks records',
        },
        {
          title: 'Delete tasks',
          name: 'taskRemove',
          description: 'Delete tasks',
        },
        {
          title: 'Assign tasks',
          name: 'taskAssign',
          description: 'Assign tasks',
          type: 'custom',
        },
      ],
    },
    {
      name: 'project',
      description: 'Project management',
      scopeField: 'teamId',
      ownerFields: ['createdBy', 'leadId'],

      scopes: [
        {
          name: 'own',
          description: 'Records user created or assigned to user',
        },
        {
          name: 'group',
          description: 'Records in user teams',
        },
        { name: 'all', description: 'All records' },
      ],

      always: true,
      actions: [
        {
          title: 'View projects records',
          name: 'projectRead',
          description: 'View projects',
          always: true,
        },
        {
          title: 'Create projects records',
          name: 'projectCreate',
          description: 'Create projects',
        },
        {
          title: 'Edit projects records',
          name: 'projectUpdate',
          description: 'Edit projects records',
        },
        {
          title: 'Delete projects records',
          name: 'projectRemove',
          description: 'Delete projects records',
        },
      ],
    },
    {
      name: 'cycle',
      description: 'Cycle management',
      scopeField: 'teamId',
      ownerFields: ['createdBy'],
      scopes: [
        {
          name: 'own',
          description: 'Records user created or assigned to user',
        },
        {
          name: 'group',
          description: 'Records in your teams',
        },
        { name: 'all', description: 'All records' },
      ],

      always: true,
      actions: [
        {
          title: 'View cycles records',
          name: 'cycleRead',
          description: 'View cycles records',
          always: true,
        },
        {
          title: 'Create cycles records',
          name: 'cycleCreate',
          description: 'Create cycles records',
        },
        {
          title: 'Edit cycles records',
          name: 'cycleUpdate',
          description: 'Edit cycles records',
        },
        {
          title: 'Delete cycles records',
          name: 'cycleRemove',
          description: 'Delete cycles records',
        },
      ],
    },
    {
      name: 'team',
      description: 'Team management',
      scopeField: null,
      ownerFields: ['createdBy'],
      always: true,
      scopes: [
        {
          name: 'own',
          description: 'Records you created or assigned to you',
        },
        {
          name: 'group',
          description: 'Records in your teams',
        },
        { name: 'all', description: 'All records' },
      ],
      actions: [
        {
          title: 'View teams records',
          name: 'teamRead',
          description: 'View teams records',
          always: true,
        },
        {
          title: 'Create teams records',
          name: 'teamCreate',
          description: 'Create teams records',
        },
        {
          title: 'Edit teams records',
          name: 'teamUpdate',
          description: 'Edit teams records',
        },
        {
          title: 'Delete teams records',
          name: 'teamRemove',
          description: 'Delete teams records',
        },
      ],
    },
  ],
  defaultGroups: [
    {
      id: 'operation:admin',
      name: 'Operation Admin',
      description: 'Full access to Operation plugin',
      permissions: [
        {
          module: 'task',
          actions: [
            'taskRead',
            'taskCreate',
            'taskUpdate',
            'taskRemove',
            'taskAssign',
          ],
          scope: 'all',
        },
        {
          module: 'project',
          actions: [
            'projectRead',
            'projectCreate',
            'projectUpdate',
            'projectRemove',
          ],
          scope: 'all',
        },
        {
          module: 'cycle',
          actions: ['cycleRead', 'cycleCreate', 'cycleUpdate', 'cycleRemove'],
          scope: 'all',
        },
        {
          module: 'team',
          actions: ['teamRead', 'teamCreate', 'teamUpdate', 'teamRemove'],
          scope: 'all',
        },
      ],
    },
    {
      id: 'operation:user',
      name: 'Operation User',
      description: 'Standard team member',
      permissions: [
        {
          module: 'task',
          actions: ['taskRead', 'taskCreate', 'taskUpdate'],
          scope: 'group',
        },
        { module: 'project', actions: ['projectRead'], scope: 'group' },
        { module: 'cycle', actions: ['cycleRead'], scope: 'group' },
        { module: 'team', actions: ['teamRead'], scope: 'group' },
      ],
    },
    {
      id: 'operation:viewer',
      name: 'Operation Viewer',
      description: 'Read-only access',
      permissions: [
        { module: 'task', actions: ['taskRead'], scope: 'group' },
        { module: 'project', actions: ['projectRead'], scope: 'group' },
      ],
    },
  ],
};
