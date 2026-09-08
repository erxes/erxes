import { IPermissionConfig } from 'erxes-api-shared/core-types';

export const permissions: IPermissionConfig = {
  plugin: 'hrm',
  modules: [
    {
      name: 'settings',
      description: 'HRM settings and payroll reference records',
      scopeField: null,
      ownerFields: [],
      scopes: [
        { name: 'own', description: 'Records user created' },
        { name: 'all', description: 'All records' },
      ],
      actions: [
        {
          title: 'View HRM settings',
          name: 'hrmSettingsView',
          description:
            'View HRM system configs, contribution profiles, grades, and seniority rules',
          always: true,
        },
        {
          title: 'Manage HRM settings',
          name: 'hrmSettingsManage',
          description:
            'Create and edit HRM system configs and payroll reference records',
        },
        {
          title: 'Remove HRM settings',
          name: 'hrmSettingsRemove',
          description:
            'Remove HRM system configs and payroll reference records',
        },
      ],
    },
  ],
  defaultGroups: [
    {
      id: 'hrm:admin',
      name: 'HRM Admin',
      description: 'View and manage HRM settings and payroll references',
      permissions: [
        {
          plugin: 'hrm',
          module: 'settings',
          actions: [
            'hrmSettingsView',
            'hrmSettingsManage',
            'hrmSettingsRemove',
          ],
          scope: 'all',
        },
      ],
    },
    {
      id: 'hrm:viewer',
      name: 'HRM Viewer',
      description: 'Read-only access to HRM settings and payroll references',
      permissions: [
        {
          plugin: 'hrm',
          module: 'settings',
          actions: ['hrmSettingsView'],
          scope: 'all',
        },
      ],
    },
  ],
};
