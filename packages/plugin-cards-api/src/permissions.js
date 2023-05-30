module.exports = {
  deals: {
    name: 'deals',
    description: 'Deals',
    actions: [
      {
        name: 'dealsAll',
        description: 'All',
        use: [
          'showDeals',
          'dealBoardsAdd',
          'dealBoardsEdit',
          'dealBoardsRemove',
          'dealPipelinesAdd',
          'dealPipelinesEdit',
          'dealPipelinesUpdateOrder',
          'dealPipelinesWatch',
          'dealPipelinesRemove',
          'dealPipelinesArchive',
          'dealPipelinesCopied',
          'dealStagesAdd',
          'dealStagesEdit',
          'dealStagesUpdateOrder',
          'dealStagesRemove',
          'dealsAdd',
          'dealsEdit',
          'dealsRemove',
          'dealsWatch',
          'dealsArchive',
          'dealsSort',
          'exportDeals',
          'dealUpdateTimeTracking'
        ]
      },
      {
        name: 'showDeals',
        description: 'Show deals'
      },
      {
        name: 'dealBoardsAdd',
        description: 'Add deal board'
      },
      {
        name: 'dealBoardsRemove',
        description: 'Remove deal board'
      },
      {
        name: 'dealPipelinesAdd',
        description: 'Add deal pipeline'
      },
      {
        name: 'dealPipelinesEdit',
        description: 'Edit deal pipeline'
      },
      {
        name: 'dealPipelinesRemove',
        description: 'Remove deal pipeline'
      },
      {
        name: 'dealPipelinesArchive',
        description: 'Archive deal pipeline'
      },
      {
        name: 'dealPipelinesCopied',
        description: 'Duplicate deal pipeline'
      },
      {
        name: 'dealPipelinesUpdateOrder',
        description: 'Update pipeline order'
      },
      {
        name: 'dealPipelinesWatch',
        description: 'Deal pipeline watch'
      },
      {
        name: 'dealStagesAdd',
        description: 'Add deal stage'
      },
      {
        name: 'dealStagesEdit',
        description: 'Edit deal stage'
      },
      {
        name: 'dealStagesUpdateOrder',
        description: 'Update stage order'
      },
      {
        name: 'dealStagesRemove',
        description: 'Remove deal stage'
      },
      {
        name: 'dealsAdd',
        description: 'Add deal'
      },
      {
        name: 'dealsEdit',
        description: 'Edit deal'
      },
      {
        name: 'dealsRemove',
        description: 'Remove deal'
      },
      {
        name: 'dealsWatch',
        description: 'Watch deal'
      },
      {
        name: 'dealsArchive',
        description: 'Archive all deals in a specific stage'
      },
      {
        name: 'dealsSort',
        description: 'Sort all deals in a specific stage'
      },
      {
        name: 'exportDeals',
        description: 'Export deals'
      },
      {
        name: 'dealUpdateTimeTracking',
        description: 'Update time tracking'
      }
    ]
  },
  purchases: {
    name: 'purchases',
    description: 'Purchases',
    actions: [
      {
        name: 'purchasesAll',
        description: 'All',
        use: [
          'showPurchases',
          'purchaseBoardsAdd',
          'purchaseBoardsEdit',
          'purchaseBoardsRemove',
          'purchasePipelinesAdd',
          'purchasePipelinesEdit',
          'purchasePipelinesUpdateOrder',
          'purchasePipelinesWatch',
          'purchasePipelinesRemove',
          'purchasePipelinesArchive',
          'purchasePipelinesCopied',
          'purchaseStagesAdd',
          'purchaseStagesEdit',
          'purchaseStagesUpdateOrder',
          'purchaseStagesRemove',
          'purchasesAdd',
          'purchasesEdit',
          'purchasesRemove',
          'purchasesWatch',
          'purchasesArchive',
          'purchasesSort',
          'exportPurchases',
          'purchaseUpdateTimeTracking'
        ]
      },
      {
        name: 'showPurchases',
        description: 'Show purchases'
      },
      {
        name: 'purchaseBoardsAdd',
        description: 'Add purchase board'
      },
      {
        name: 'purchaseBoardsRemove',
        description: 'Remove purchase board'
      },
      {
        name: 'purchasePipelinesAdd',
        description: 'Add purchase pipeline'
      },
      {
        name: 'purchasePipelinesEdit',
        description: 'Edit purchase pipeline'
      },
      {
        name: 'purchasePipelinesRemove',
        description: 'Remove purchase pipeline'
      },
      {
        name: 'purchasePipelinesArchive',
        description: 'Archive purchase pipeline'
      },
      {
        name: 'purchasePipelinesCopied',
        description: 'Duplicate purchase pipeline'
      },
      {
        name: 'purchasePipelinesUpdateOrder',
        description: 'Update pipeline order'
      },
      {
        name: 'purchasePipelinesWatch',
        description: 'purchase pipeline watch'
      },
      {
        name: 'purchaseStagesAdd',
        description: 'Add purchase stage'
      },
      {
        name: 'purchaseStagesEdit',
        description: 'Edit purchase stage'
      },
      {
        name: 'purchaseStagesUpdateOrder',
        description: 'Update stage order'
      },
      {
        name: 'purchaseStagesRemove',
        description: 'Remove purchase stage'
      },
      {
        name: 'purchasesAdd',
        description: 'Add purchase'
      },
      {
        name: 'purchasesEdit',
        description: 'Edit purchase'
      },
      {
        name: 'purchasesRemove',
        description: 'Remove purchase'
      },
      {
        name: 'purchasesWatch',
        description: 'Watch purchase'
      },
      {
        name: 'purchasesArchive',
        description: 'Archive all purchases in a specific stage'
      },
      {
        name: 'purchasesSort',
        description: 'Sort all purchases in a specific stage'
      },
      {
        name: 'exportpurchases',
        description: 'Export purchases'
      },
      {
        name: 'purchaseUpdateTimeTracking',
        description: 'Update time tracking'
      }
    ]
  },
  tickets: {
    name: 'tickets',
    description: 'Tickets',
    actions: [
      {
        name: 'ticketsAll',
        description: 'All',
        use: [
          'showTickets',
          'ticketBoardsAdd',
          'ticketBoardsEdit',
          'ticketBoardsRemove',
          'ticketPipelinesAdd',
          'ticketPipelinesEdit',
          'ticketPipelinesUpdateOrder',
          'ticketPipelinesWatch',
          'ticketPipelinesRemove',
          'ticketPipelinesArchive',
          'ticketPipelinesCopied',
          'ticketStagesAdd',
          'ticketStagesEdit',
          'ticketStagesUpdateOrder',
          'ticketStagesRemove',
          'ticketsAdd',
          'ticketsEdit',
          'ticketsRemove',
          'ticketsWatch',
          'ticketsArchive',
          'ticketsSort',
          'exportTickets',
          'ticketUpdateTimeTracking'
        ]
      },
      {
        name: 'showTickets',
        description: 'Show tickets'
      },
      {
        name: 'ticketBoardsAdd',
        description: 'Add ticket board'
      },
      {
        name: 'ticketBoardsEdit',
        description: 'Edit ticket board'
      },
      {
        name: 'ticketBoardsRemove',
        description: 'Remove ticket board'
      },
      {
        name: 'ticketPipelinesAdd',
        description: 'Add ticket pipeline'
      },
      {
        name: 'ticketPipelinesEdit',
        description: 'Edit ticket pipeline'
      },
      {
        name: 'ticketPipelinesRemove',
        description: 'Remove ticket pipeline'
      },
      {
        name: 'ticketPipelinesArchive',
        description: 'Archive ticket pipeline'
      },
      {
        name: 'ticketPipelinesCopied',
        description: 'Duplicate ticket pipeline'
      },
      {
        name: 'ticketPipelinesWatch',
        description: 'Ticket pipeline watch'
      },
      {
        name: 'ticketPipelinesUpdateOrder',
        description: 'Update pipeline order'
      },
      {
        name: 'ticketStagesAdd',
        description: 'Add ticket stage'
      },
      {
        name: 'ticketStagesEdit',
        description: 'Edit ticket stage'
      },
      {
        name: 'ticketStagesUpdateOrder',
        description: 'Update stage order'
      },
      {
        name: 'ticketStagesRemove',
        description: 'Remove ticket stage'
      },
      {
        name: 'ticketsAdd',
        description: 'Add ticket'
      },
      {
        name: 'ticketsEdit',
        description: 'Edit ticket'
      },
      {
        name: 'ticketsRemove',
        description: 'Remove ticket'
      },
      {
        name: 'ticketsWatch',
        description: 'Watch ticket'
      },
      {
        name: 'ticketsArchive',
        description: 'Archive all tickets in a specific stage'
      },
      {
        name: 'ticketsSort',
        description: 'Sort all tickets in a specific stage'
      },
      {
        name: 'exportTickets',
        description: 'Export tickets'
      },
      {
        name: 'ticketUpdateTimeTracking',
        description: 'Update time tracking'
      }
    ]
  },
  growthHacks: {
    name: 'growthHacks',
    description: 'Growth hacking',
    actions: [
      {
        name: 'growthHacksAll',
        description: 'All',
        use: [
          'showGrowthHacks',
          'growthHackBoardsAdd',
          'growthHackBoardsEdit',
          'growthHackBoardsRemove',
          'growthHackPipelinesAdd',
          'growthHackPipelinesEdit',
          'growthHackPipelinesUpdateOrder',
          'growthHackPipelinesWatch',
          'growthHackPipelinesRemove',
          'growthHackPipelinesArchive',
          'growthHackPipelinesCopied',
          'growthHackStagesAdd',
          'growthHackStagesEdit',
          'growthHackStagesUpdateOrder',
          'growthHackStagesRemove',
          'growthHacksAdd',
          'growthHacksEdit',
          'growthHacksRemove',
          'growthHacksWatch',
          'growthHacksArchive',
          'growthHacksSort',
          'growthHackTemplatesAdd',
          'growthHackTemplatesEdit',
          'growthHackTemplatesRemove',
          'growthHackTemplatesDuplicate',
          'showGrowthHackTemplates'
        ]
      },
      {
        name: 'showGrowthHacks',
        description: 'Show growth hacks'
      },
      {
        name: 'growthHackBoardsAdd',
        description: 'Add growth hacking board'
      },
      {
        name: 'growthHackBoardsRemove',
        description: 'Remove growth hacking board'
      },
      {
        name: 'growthHackPipelinesAdd',
        description: 'Add growth hacking pipeline'
      },
      {
        name: 'growthHackPipelinesEdit',
        description: 'Edit growth hacking pipeline'
      },
      {
        name: 'growthHackPipelinesRemove',
        description: 'Remove growth hacking pipeline'
      },
      {
        name: 'growthHackPipelinesArchive',
        description: 'Archive growth hacking pipeline'
      },
      {
        name: 'growthHackPipelinesCopied',
        description: 'Copied growth hacking pipeline'
      },
      {
        name: 'growthHackPipelinesWatch',
        description: 'Growth hacking pipeline watch'
      },
      {
        name: 'growthHackPipelinesUpdateOrder',
        description: 'Update pipeline order'
      },
      {
        name: 'growthHackStagesAdd',
        description: 'Add growth hacking stage'
      },
      {
        name: 'growthHackStagesEdit',
        description: 'Edit growth hacking stage'
      },
      {
        name: 'growthHackStagesUpdateOrder',
        description: 'Update stage order'
      },
      {
        name: 'growthHackStagesRemove',
        description: 'Remove growth hacking stage'
      },
      {
        name: 'growthHacksAdd',
        description: 'Add growth hacking'
      },
      {
        name: 'growthHacksEdit',
        description: 'Edit growth hacking'
      },
      {
        name: 'growthHacksRemove',
        description: 'Remove growth hacking'
      },
      {
        name: 'growthHacksWatch',
        description: 'Watch growth hacking'
      },
      {
        name: 'growthHacksArchive',
        description: 'Archive all growth hacks in a specific stage'
      },
      {
        name: 'growthHacksSort',
        description: 'Sort all growth hacks in a specific stage'
      },
      {
        name: 'growthHackTemplatesAdd',
        description: 'Add growth hacking template'
      },
      {
        name: 'growthHackTemplatesEdit',
        description: 'Edit growth hacking template'
      },
      {
        name: 'growthHackTemplatesRemove',
        description: 'Remove growth hacking template'
      },
      {
        name: 'growthHackTemplatesDuplicate',
        description: 'Duplicate growth hacking template'
      },
      {
        name: 'showGrowthHackTemplates',
        description: 'Show growth hacking template'
      }
    ]
  },
  tasks: {
    name: 'tasks',
    description: 'Tasks',
    actions: [
      {
        name: 'tasksAll',
        description: 'All',
        use: [
          'showTasks',
          'taskBoardsAdd',
          'taskBoardsEdit',
          'taskBoardsRemove',
          'taskPipelinesAdd',
          'taskPipelinesEdit',
          'taskPipelinesUpdateOrder',
          'taskPipelinesWatch',
          'taskPipelinesRemove',
          'taskPipelinesArchive',
          'taskPipelinesCopied',
          'taskStagesAdd',
          'taskStagesEdit',
          'taskStagesUpdateOrder',
          'taskStagesRemove',
          'tasksAdd',
          'tasksEdit',
          'tasksRemove',
          'tasksWatch',
          'tasksArchive',
          'tasksSort',
          'taskUpdateTimeTracking',
          'exportTasks'
        ]
      },
      {
        name: 'showTasks',
        description: 'Show tasks'
      },
      {
        name: 'taskBoardsAdd',
        description: 'Add task board'
      },
      {
        name: 'taskBoardsRemove',
        description: 'Remove task board'
      },
      {
        name: 'taskPipelinesAdd',
        description: 'Add task pipeline'
      },
      {
        name: 'taskPipelinesEdit',
        description: 'Edit task pipeline'
      },
      {
        name: 'taskPipelinesRemove',
        description: 'Remove task pipeline'
      },
      {
        name: 'taskPipelinesArchive',
        description: 'Archive task pipeline'
      },
      {
        name: 'taskPipelinesCopied',
        description: 'Duplicate task pipeline'
      },
      {
        name: 'taskPipelinesWatch',
        description: 'Task pipeline watch'
      },
      {
        name: 'taskPipelinesUpdateOrder',
        description: 'Update pipeline order'
      },
      {
        name: 'taskStagesAdd',
        description: 'Add task stage'
      },
      {
        name: 'taskStagesEdit',
        description: 'Edit task stage'
      },
      {
        name: 'taskStagesUpdateOrder',
        description: 'Update stage order'
      },
      {
        name: 'taskStagesRemove',
        description: 'Remove task stage'
      },
      {
        name: 'tasksAdd',
        description: 'Add task'
      },
      {
        name: 'tasksEdit',
        description: 'Edit task'
      },
      {
        name: 'tasksRemove',
        description: 'Remove task'
      },
      {
        name: 'tasksWatch',
        description: 'Watch task'
      },
      {
        name: 'tasksArchive',
        description: 'Archive all tasks in a specific stage'
      },
      {
        name: 'tasksSort',
        description: 'Sort all tasks in a specific stage'
      },
      {
        name: 'taskUpdateTimeTracking',
        description: 'Update time tracking'
      },
      {
        name: 'exportTasks',
        description: 'Export tasks'
      }
    ]
  },
}