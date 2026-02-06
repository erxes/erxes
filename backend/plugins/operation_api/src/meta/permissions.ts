import { IPermissionConfig } from 'erxes-api-shared/core-types';

export const permissions: IPermissionConfig = {
  plugin: 'operation',
  scopes: {
    own: 'Records you created or assigned to you',
    group: 'Records in your teams',
    all: 'All records',
  },
  modules: [
    {
      name: 'task',
      description: 'Task management',
      scopeField: 'teamId',
      ownerFields: ['createdBy', 'assignedTo'],
      always: false,
      actions: [
        { name: 'taskRead', description: 'View tasks', always: true },
        { name: 'taskCreate', description: 'Create tasks' },
        { name: 'taskUpdate', description: 'Edit tasks' },
        { name: 'taskRemove', description: 'Delete tasks' },
        { name: 'taskAssign', description: 'Assign tasks', type: 'custom' },
      ],
    },
    {
      name: 'project',
      description: 'Project management',
      scopeField: 'teamId',
      ownerFields: ['createdBy', 'leadId'],
      always: true,
      actions: [
        {
          name: 'projectRead',
          description: 'View projects',
          always: true,
        },
        { name: 'projectCreate', description: 'Create projects' },
        { name: 'projectUpdate', description: 'Edit projects' },
        { name: 'projectRemove', description: 'Delete projects' },
      ],
    },
    {
      name: 'cycle',
      description: 'Cycle management',
      scopeField: 'teamId',
      ownerFields: ['createdBy'],
      always: true,
      actions: [
        { name: 'cycleRead', description: 'View cycles', always: true },
        { name: 'cycleCreate', description: 'Create cycles' },
        { name: 'cycleUpdate', description: 'Edit cycles' },
        { name: 'cycleRemove', description: 'Delete cycles' },
      ],
    },
    {
      name: 'team',
      description: 'Team management',
      scopeField: null,
      ownerFields: ['createdBy'],
      always: true,
      actions: [
        { name: 'teamRead', description: 'View teams', always: true },
        { name: 'teamCreate', description: 'Create teams' },
        { name: 'teamUpdate', description: 'Edit teams' },
        { name: 'teamRemove', description: 'Delete teams' },
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
