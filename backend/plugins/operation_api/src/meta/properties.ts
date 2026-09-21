import { IPropertyMeta } from 'erxes-api-shared/core-modules';

export const properties: IPropertyMeta = {
  types: [
    {
      description: 'Tasks',
      type: 'task',
      systemFields: [
        { code: 'name', name: 'Name', type: 'text' },
        { code: 'number', name: 'Number', type: 'number' },
        { code: 'status', name: 'Status', type: 'select' },
        { code: 'priority', name: 'Priority', type: 'select' },
        { code: 'assigneeId', name: 'Assigned to', type: 'relation' },
        { code: 'teamId', name: 'Team', type: 'relation' },
        { code: 'projectId', name: 'Project', type: 'relation' },
        { code: 'milestoneId', name: 'Milestone', type: 'relation' },
        { code: 'cycleId', name: 'Cycle', type: 'relation' },
        { code: 'estimatePoint', name: 'Estimate', type: 'number' },
        { code: 'labelIds', name: 'Labels', type: 'multiSelect' },
        { code: 'tagIds', name: 'Tags', type: 'multiSelect' },
        { code: 'startDate', name: 'Start date', type: 'date' },
        { code: 'targetDate', name: 'Target date', type: 'date' },
        { code: 'description', name: 'Description', type: 'textarea' },
      ],
    },
    {
      description: 'Projects',
      type: 'project',
      systemFields: [
        { code: 'name', name: 'Name', type: 'text' },
        { code: 'status', name: 'Status', type: 'select' },
        { code: 'priority', name: 'Priority', type: 'select' },
        { code: 'leadId', name: 'Lead', type: 'relation' },
        { code: 'memberIds', name: 'Members', type: 'relation' },
        { code: 'teamIds', name: 'Teams', type: 'relation' },
        { code: 'tagIds', name: 'Tags', type: 'multiSelect' },
        { code: 'startDate', name: 'Start date', type: 'date' },
        { code: 'targetDate', name: 'Target date', type: 'date' },
        { code: 'description', name: 'Description', type: 'textarea' },
      ],
    },
  ],
};
