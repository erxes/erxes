import { IPermissionConfig } from 'erxes-api-shared/core-types';

export const permissions: IPermissionConfig = {
  plugin: 'branched',
  modules: [
    {
      name: 'branch',
      description: 'Branch management',
      scopeField: null,
      ownerFields: ['managerId'],
      scopes: [
        { name: 'own', description: 'Branches managed by user' },
        { name: 'all', description: 'All branches' },
      ],
      actions: [
        { title: 'View branches', name: 'showBranches', description: 'View branches', always: true },
        { title: 'Add branches', name: 'branchesAdd', description: 'Create branches' },
        { title: 'Edit branches', name: 'branchesEdit', description: 'Edit branches' },
        { title: 'Remove branches', name: 'branchesRemove', description: 'Delete branches' },
      ],
    },
    {
      name: 'sale',
      description: 'Sales management',
      scopeField: null,
      ownerFields: [],
      scopes: [{ name: 'all', description: 'All sales data' }],
      actions: [
        { title: 'View sales', name: 'showSales', description: 'View sales', always: true },
        { title: 'Add sales', name: 'salesAdd', description: 'Create sales records' },
        { title: 'Edit sales', name: 'salesEdit', description: 'Edit sales records' },
        { title: 'Remove sales', name: 'salesRemove', description: 'Delete sales records' },
      ],
    },
    {
      name: 'task',
      description: 'Task management',
      scopeField: null,
      ownerFields: ['assigneeId'],
      scopes: [
        { name: 'own', description: 'Tasks assigned to user' },
        { name: 'all', description: 'All tasks' },
      ],
      actions: [
        { title: 'View tasks', name: 'showTasks', description: 'View tasks', always: true },
        { title: 'Add tasks', name: 'tasksAdd', description: 'Create tasks' },
        { title: 'Edit tasks', name: 'tasksEdit', description: 'Edit tasks' },
        { title: 'Remove tasks', name: 'tasksRemove', description: 'Delete tasks' },
      ],
    },
  ],
  defaultGroups: [
    {
      id: 'branched:admin',
      name: 'Branched Admin',
      description: 'Full access to Branched plugin',
      permissions: [
        { plugin: 'branched', module: 'branch', actions: ['showBranches', 'branchesAdd', 'branchesEdit', 'branchesRemove'], scope: 'all' },
        { plugin: 'branched', module: 'sale', actions: ['showSales', 'salesAdd', 'salesEdit', 'salesRemove'], scope: 'all' },
        { plugin: 'branched', module: 'task', actions: ['showTasks', 'tasksAdd', 'tasksEdit', 'tasksRemove'], scope: 'all' },
      ],
    },
  ],
};
