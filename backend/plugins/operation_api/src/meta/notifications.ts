export const notifications = {
  pluginName: 'operation',
  modules: [
    {
      name: 'task',
      description: 'Task management',
      icon: 'IconChecklist',
      events: [
        {
          title: 'Task assignee',
          name: 'taskAssignee',
          description: 'Task assignee',
        },
      ],
    },
    {
      name: 'project',
      description: 'Project management',
      icon: 'IconClipboard',
      events: [
        {
          title: 'Project assignee',
          name: 'projectAssignee',
          description: 'Project assignee',
        },
      ],
    },
    {
      name: 'team',
      description: 'Team management',
      icon: 'IconUserSquare',
      events: [
        {
          title: 'Team assignee',
          name: 'teamAssignee',
          description: 'Team assignee',
        },
      ],
    },
  ],
};
