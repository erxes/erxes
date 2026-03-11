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
      name: 'triage',
      description: 'Triage management',
      scopeField: 'teamId',
      ownerFields: ['createdBy'],

      scopes: [
        {
          name: 'own',
          description: 'Records user created',
        },
        {
          name: 'group',
          description: 'Records in user teams',
        },
        { name: 'all', description: 'All records' },
      ],

      actions: [
        {
          title: 'View triage records',
          name: 'triageRead',
          description: 'View triage records',
          always: true,
        },
        {
          title: 'Create triage records',
          name: 'triageCreate',
          description: 'Create triage records',
        },
        {
          title: 'Edit triage records',
          name: 'triageUpdate',
          description: 'Edit triage records',
        },
        {
          title: 'Convert triage to task',
          name: 'triageConvert',
          description: 'Convert triage to task',
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
      name: 'milestone',
      description: 'Milestone management',
      scopeField: null,
      ownerFields: ['createdBy'],

      scopes: [
        {
          name: 'own',
          description: 'Records user created',
        },
        {
          name: 'group',
          description: 'Records in user projects',
        },
        { name: 'all', description: 'All records' },
      ],

      actions: [
        {
          title: 'View milestones records',
          name: 'milestoneRead',
          description: 'View milestones',
          always: true,
        },
        {
          title: 'Create milestones records',
          name: 'milestoneCreate',
          description: 'Create milestones',
        },
        {
          title: 'Edit milestones records',
          name: 'milestoneUpdate',
          description: 'Edit milestones',
        },
        {
          title: 'Delete milestones records',
          name: 'milestoneRemove',
          description: 'Delete milestones',
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
        {
          title: 'End cycles',
          name: 'cycleEnd',
          description: 'End active cycles',
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
        {
          title: 'Manage team members',
          name: 'teamMemberManage',
          description: 'Add, remove, and update team members',
        },
      ],
    },
    {
      name: 'note',
      description: 'Note management',
      scopeField: null,
      ownerFields: ['createdBy'],

      scopes: [
        {
          name: 'own',
          description: 'Notes user created',
        },
        { name: 'all', description: 'All notes' },
      ],

      actions: [
        {
          title: 'View notes',
          name: 'noteRead',
          description: 'View notes',
          always: true,
        },
        {
          title: 'Create notes',
          name: 'noteCreate',
          description: 'Create notes',
        },
        {
          title: 'Edit notes',
          name: 'noteUpdate',
          description: 'Edit notes',
        },
        {
          title: 'Delete notes',
          name: 'noteRemove',
          description: 'Delete notes',
        },
      ],
    },
    {
      name: 'status',
      description: 'Status management',
      scopeField: 'teamId',
      ownerFields: [],

      scopes: [
        {
          name: 'group',
          description: 'Statuses in user teams',
        },
        { name: 'all', description: 'All statuses' },
      ],

      actions: [
        {
          title: 'View statuses',
          name: 'statusRead',
          description: 'View statuses',
          always: true,
        },
        {
          title: 'Create statuses',
          name: 'statusCreate',
          description: 'Create statuses',
        },
        {
          title: 'Edit statuses',
          name: 'statusUpdate',
          description: 'Edit statuses',
        },
        {
          title: 'Delete statuses',
          name: 'statusRemove',
          description: 'Delete statuses',
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
          plugin: 'operation',
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
          plugin: 'operation',
          module: 'triage',
          actions: [
            'triageRead',
            'triageCreate',
            'triageUpdate',
            'triageConvert',
          ],
          scope: 'all',
        },
        {
          plugin: 'operation',
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
          plugin: 'operation',
          module: 'milestone',
          actions: [
            'milestoneRead',
            'milestoneCreate',
            'milestoneUpdate',
            'milestoneRemove',
          ],
          scope: 'all',
        },
        {
          plugin: 'operation',
          module: 'cycle',
          actions: [
            'cycleRead',
            'cycleCreate',
            'cycleUpdate',
            'cycleRemove',
            'cycleEnd',
          ],
          scope: 'all',
        },
        {
          plugin: 'operation',
          module: 'team',
          actions: [
            'teamRead',
            'teamCreate',
            'teamUpdate',
            'teamRemove',
            'teamMemberManage',
          ],
          scope: 'all',
        },
        {
          plugin: 'operation',
          module: 'note',
          actions: ['noteRead', 'noteCreate', 'noteUpdate', 'noteRemove'],
          scope: 'all',
        },
        {
          plugin: 'operation',
          module: 'status',
          actions: [
            'statusRead',
            'statusCreate',
            'statusUpdate',
            'statusRemove',
          ],
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
          plugin: 'operation',
          module: 'task',
          actions: ['taskRead', 'taskCreate', 'taskUpdate'],
          scope: 'group',
        },
        {
          plugin: 'operation',
          module: 'triage',
          actions: ['triageRead', 'triageCreate', 'triageUpdate'],
          scope: 'group',
        },
        {
          plugin: 'operation',
          module: 'project',
          actions: ['projectRead'],
          scope: 'group',
        },
        {
          plugin: 'operation',
          module: 'milestone',
          actions: ['milestoneRead'],
          scope: 'group',
        },
        {
          plugin: 'operation',
          module: 'cycle',
          actions: ['cycleRead'],
          scope: 'group',
        },
        {
          plugin: 'operation',
          module: 'team',
          actions: ['teamRead'],
          scope: 'group',
        },
        {
          plugin: 'operation',
          module: 'note',
          actions: ['noteRead', 'noteCreate', 'noteUpdate'],
          scope: 'own',
        },
        {
          plugin: 'operation',
          module: 'status',
          actions: ['statusRead'],
          scope: 'group',
        },
      ],
    },
    {
      id: 'operation:viewer',
      name: 'Operation Viewer',
      description: 'Read-only access',
      permissions: [
        {
          plugin: 'operation',
          module: 'task',
          actions: [],
          scope: 'group',
        },
        {
          plugin: 'operation',
          module: 'project',
          actions: ['projectRead'],
          scope: 'group',
        },
        {
          plugin: 'operation',
          module: 'milestone',
          actions: ['milestoneRead'],
          scope: 'group',
        },
        {
          plugin: 'operation',
          module: 'cycle',
          actions: ['cycleRead'],
          scope: 'group',
        },
        {
          plugin: 'operation',
          module: 'team',
          actions: ['teamRead'],
          scope: 'group',
        },
        {
          plugin: 'operation',
          module: 'note',
          actions: ['noteRead'],
          scope: 'group',
        },
        {
          plugin: 'operation',
          module: 'status',
          actions: ['statusRead'],
          scope: 'group',
        },
      ],
    },
  ],
};
