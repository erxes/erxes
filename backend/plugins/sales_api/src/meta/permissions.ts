import { IPermissionConfig } from 'erxes-api-shared/core-types';

export const permissions: IPermissionConfig = {
  plugin: 'sales',

  modules: [
    {
      name: 'deal',
      description: 'Deals management',
      scopeField: null,
      ownerFields: ['userId', 'assignedUserIds'],
      scopes: [
        { name: 'own', description: 'Deals created by or assigned to user' },
        { name: 'group', description: 'Deals in user departments' },
        { name: 'all', description: 'All deals' },
      ],
      actions: [
        { title: 'View deals', name: 'showDeals', description: 'View deals', always: true },
        { title: 'Add deals', name: 'dealsAdd', description: 'Create deals' },
        { title: 'Edit deals', name: 'dealsEdit', description: 'Edit deals' },
        { title: 'Remove deals', name: 'dealsRemove', description: 'Delete deals' },
        { title: 'Watch deals', name: 'dealsWatch', description: 'Watch deals' },
        { title: 'Archive deals', name: 'dealsArchive', description: 'Archive / unarchive deals' },
      ],
    },
    {
      name: 'board',
      description: 'Board management',
      scopeField: null,
      ownerFields: [],
      scopes: [{ name: 'all', description: 'All boards' }],
      actions: [
        { title: 'Add boards', name: 'boardsAdd', description: 'Create boards' },
        { title: 'Edit boards', name: 'boardsEdit', description: 'Edit boards' },
        { title: 'Remove boards', name: 'boardsRemove', description: 'Remove boards' },
        { title: 'Update time tracking', name: 'updateTimeTracking', description: 'Update time tracking on board items' },
      ],
    },
    {
      name: 'pipeline',
      description: 'Pipeline management',
      scopeField: null,
      ownerFields: [],
      scopes: [{ name: 'all', description: 'All pipelines' }],
      actions: [
        { title: 'Add pipelines', name: 'pipelinesAdd', description: 'Create pipelines' },
        { title: 'Edit pipelines', name: 'pipelinesEdit', description: 'Edit pipelines' },
        { title: 'Watch pipelines', name: 'pipelinesWatch', description: 'Watch pipelines' },
      ],
    },
    {
      name: 'stage',
      description: 'Stage management',
      scopeField: null,
      ownerFields: [],
      scopes: [{ name: 'all', description: 'All stages' }],
      actions: [
        { title: 'Edit stages', name: 'stagesEdit', description: 'Edit stages' },
        { title: 'Remove stages', name: 'stagesRemove', description: 'Remove stages' },
        { title: 'Sort items in stage', name: 'itemsSort', description: 'Sort items in a stage' },
      ],
    },
    {
      name: 'checklist',
      description: 'Checklist management',
      scopeField: null,
      ownerFields: [],
      scopes: [{ name: 'all', description: 'All checklists' }],
      actions: [
        { title: 'Add checklists', name: 'checklistsAdd', description: 'Create checklists' },
        { title: 'Edit checklists', name: 'checklistsEdit', description: 'Edit checklists (includes item changes)' },
        { title: 'Remove checklists', name: 'checklistsRemove', description: 'Remove checklists' },
      ],
    },
    {
      name: 'pipelineLabel',
      description: 'Pipeline label management',
      scopeField: null,
      ownerFields: [],
      scopes: [{ name: 'all', description: 'All pipeline labels' }],
      actions: [
        { title: 'Add pipeline labels', name: 'pipelineLabelsAdd', description: 'Create pipeline labels' },
        { title: 'Edit pipeline labels', name: 'pipelineLabelsEdit', description: 'Edit pipeline labels' },
        { title: 'Remove pipeline labels', name: 'pipelineLabelsRemove', description: 'Remove pipeline labels' },
      ],
    },
    {
      name: 'pipelineTemplate',
      description: 'Pipeline template management',
      scopeField: null,
      ownerFields: [],
      scopes: [{ name: 'all', description: 'All pipeline templates' }],
      actions: [
        { title: 'View templates', name: 'showTemplates', description: 'View pipeline templates', always: true },
        { title: 'Add templates', name: 'templatesAdd', description: 'Create templates' },
        { title: 'Edit templates', name: 'templatesEdit', description: 'Edit templates' },
        { title: 'Remove templates', name: 'templatesRemove', description: 'Remove templates' },
      ],
    },
    {
      name: 'pos',
      description: 'Point of Sale management',
      scopeField: null,
      ownerFields: [],
      scopes: [{ name: 'all', description: 'All POS data' }],
      actions: [
        // Read actions (queries)
        { title: 'View POS details', name: 'posRead', description: 'View POS configuration', always: true },
        { title: 'View orders', name: 'posOrderRead', description: 'View POS orders', always: true },
        { title: 'View covers', name: 'posCoversRead', description: 'View POS covers', always: true },
        // Mutation actions
        { title: 'Add POS', name: 'posAdd', description: 'Create a new POS' },
        { title: 'Edit POS', name: 'posEdit', description: 'Update POS' },
        { title: 'Remove POS', name: 'posRemove', description: 'Delete POS' },
        { title: 'Return order', name: 'posOrderReturnBill', description: 'Return a POS order' },
        { title: 'Change order payments', name: 'posOrderChangePayments', description: 'Modify order payments' },
        { title: 'Manage product groups', name: 'productGroupsBulkInsert', description: 'Bulk update product groups' },
        { title: 'Manage slots', name: 'posSlotBulkUpdate', description: 'Bulk update POS slots' },
      ],
    },
  ],

  defaultGroups: [
    {
      id: 'sales:admin',
      name: 'Sales Admin',
      description: 'Full access to Sales plugin',
      permissions: [
        { plugin: 'sales', module: 'deal', actions: ['showDeals','dealsAdd','dealsEdit','dealsRemove','dealsWatch','dealsArchive'], scope: 'all' },
        { plugin: 'sales', module: 'board', actions: ['boardsAdd','boardsEdit','boardsRemove','updateTimeTracking'], scope: 'all' },
        { plugin: 'sales', module: 'pipeline', actions: ['pipelinesAdd','pipelinesEdit','pipelinesWatch'], scope: 'all' },
        { plugin: 'sales', module: 'stage', actions: ['stagesEdit','stagesRemove','itemsSort'], scope: 'all' },
        { plugin: 'sales', module: 'checklist', actions: ['checklistsAdd','checklistsEdit','checklistsRemove'], scope: 'all' },
        { plugin: 'sales', module: 'pipelineLabel', actions: ['pipelineLabelsAdd','pipelineLabelsEdit','pipelineLabelsRemove'], scope: 'all' },
        { plugin: 'sales', module: 'pipelineTemplate', actions: ['showTemplates','templatesAdd','templatesEdit','templatesRemove'], scope: 'all' },
        { plugin: 'sales', module: 'pos', actions: ['posRead', 'posOrderRead', 'posCoversRead', 'posAdd', 'posEdit', 'posRemove', 'posOrderReturnBill', 'posOrderChangePayments', 'productGroupsBulkInsert', 'posSlotBulkUpdate'], scope: 'all' },
      ],
    },
    {
      id: 'sales:user',
      name: 'Sales User',
      description: 'Standard sales team member',
      permissions: [
        { plugin: 'sales', module: 'deal', actions: ['showDeals','dealsAdd','dealsEdit','dealsWatch'], scope: 'group' },
        { plugin: 'sales', module: 'checklist', actions: ['checklistsAdd','checklistsEdit'], scope: 'all' },
        { plugin: 'sales', module: 'pipeline', actions: ['pipelinesWatch'], scope: 'all' },
        { plugin: 'sales', module: 'pos', actions: ['posRead', 'posOrderRead', 'posCoversRead', 'posOrderReturnBill', 'posOrderChangePayments', 'productGroupsBulkInsert', 'posSlotBulkUpdate'], scope: 'group' },
      ],
    },
    {
      id: 'sales:viewer',
      name: 'Sales Viewer',
      description: 'Read‑only access to deals and POS',
      permissions: [
        { plugin: 'sales', module: 'deal', actions: ['showDeals'], scope: 'group' },
        { plugin: 'sales', module: 'pos', actions: ['posRead', 'posOrderRead', 'posCoversRead'], scope: 'group' },
      ],
    },
  ],
};