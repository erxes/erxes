export const notifications = {
  plugin: 'operation',

  modules: [
    {
      name: 'task',
      description: 'Task Notifications',
      icon: 'IconChecklist',

      events: [
        {
          name: 'taskAssignee',
          title: 'Task Assigned',
          description: 'Triggered when a user is assigned to a task',
        },
        {
          name: 'taskStatus',
          title: 'Task Status changed',
          description: 'Triggered when a task status is changed',
        },
      ],
    },
    {
      name: 'project',
      description: 'Project Notifications',
      icon: 'IconClipboard',

      events: [
        {
          name: 'projectAssignee',
          title: 'Project Assigned',
          description: 'Triggered when a user is assigned to a project',
        },
        {
          name: 'projectStatus',
          title: 'Project Status changed',
          description: 'Triggered when a project status is changed',
        },
      ],
    },
  ],
};
