export const notifications = {
  plugin: 'sales',

  modules: [
    {
      name: 'deals',
      description: 'Deals',
      icon: 'IconChecklist',

      events: [
        {
          name: 'dealAssignee',
          title: 'Deal assignee',
          description: 'Triggered when a user is assigned to a deal',
        },
        {
          name: 'dealStatus',
          title: 'Deal status changed',
          description: 'Triggered when a deal status is changed',
        },
      ],
    },
    {
      name: 'note',
      description: 'Note',
      icon: 'IconNote',

      events: [
        {
          name: 'note',
          title: 'Mentioned in note',
          description: 'Triggered when a user is mentioned in a note',
        },
      ],
    },
  ],
};
