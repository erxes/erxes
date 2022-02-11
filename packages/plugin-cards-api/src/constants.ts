export const IMPORT_TYPES = [
  {
    text: 'Deal',
    contentType: 'deal',
    icon: 'signal-alt-3',
    serviceType: 'cards'
  },
  {
    text: 'Task',
    contentType: 'task',
    icon: 'signal-alt-3',
    serviceType: 'cards'
  },
  {
    text: 'Ticket',
    contentType: 'ticket',
    icon: 'signal-alt-3',
    serviceType: 'cards'
  }
];

export const EXPORT_TYPES = [
  {
    text: 'Deal',
    contentType: 'deal',
    icon: 'signal-alt-3',
    serviceType: 'cards'
  },
  {
    text: 'Task',
    contentType: 'task',
    icon: 'signal-alt-3',
    serviceType: 'cards'
  },
  {
    text: 'Ticket',
    contentType: 'ticket',
    icon: 'signal-alt-3',
    serviceType: 'cards'
  }
];

export const PRIORITIES = {
  CRITICAL: 'Critical',
  HIGH: 'High',
  NORMAL: 'Normal',
  LOW: 'Low',
  ALL: [
    {
      name: 'Critical',
      color: '#EA475D'
    },
    { name: 'High', color: '#F7CE53' },
    { name: 'Normal', color: '#3B85F4' },
    { name: 'Low', color: '#AAAEB3' }
  ]
};

export const CLOSE_DATE_TYPES = {
  NEXT_DAY: 'nextDay',
  NEXT_WEEK: 'nextWeek',
  NEXT_MONTH: 'nextMonth',
  NO_CLOSE_DATE: 'noCloseDate',
  OVERDUE: 'overdue',
  ALL: [
    {
      name: 'Next day',
      value: 'nextDay'
    },
    {
      name: 'Next week',
      value: 'nextWeek'
    },
    {
      name: 'Next month',
      value: 'nextMonth'
    },
    {
      name: 'No close date',
      value: 'noCloseDate'
    },
    {
      name: 'Over due',
      value: 'overdue'
    }
  ]
};

export const BOARD_ITEM_EXTENDED_FIELDS = [
  {
    _id: Math.random(),
    name: 'boardName',
    label: 'Board name',
    type: 'string'
  },
  {
    _id: Math.random(),
    name: 'pipelineName',
    label: 'Pipeline name',
    type: 'string'
  },
  {
    _id: Math.random(),
    name: 'stageName',
    label: 'Stage name',
    type: 'string'
  },
  {
    _id: Math.random(),
    name: 'assignedUserEmail',
    label: 'Assigned user email',
    type: 'string'
  }
];

export const BOARD_BASIC_INFOS = [
  'userId',
  'createdAt',
  'order',
  'name',
  'closeDate',
  'reminderMinute',
  'isComplete',
  'description',
  'assignedUsers',
  'watchedUserIds',
  'labelIds',
  'stageId',
  'initialStageId',
  'modifiedAt',
  'modifiedBy',
  'priority'
];

export const MODULE_NAMES = {
  BOARD: 'board',
  BOARD_DEAL: 'dealBoards',
  BOARD_TASK: 'taskBoards',
  BOARD_TICKET: 'ticketBoards',
  BOARD_GH: 'growthHackBoards',
  PIPELINE_DEAL: 'dealPipelines',
  PIPELINE_TASK: 'taskPipelines',
  PIPELINE_TICKET: 'ticketPipelines',
  PIPELINE_GH: 'growthHackPipelines',
  STAGE_DEAL: 'dealStages',
  STAGE_TASK: 'taskStages',
  STAGE_TICKET: 'ticketStages',
  STAGE_GH: 'growthHackStages',
  CHECKLIST: 'checklist',
  CHECKLIST_ITEM: 'checkListItem',
  DEAL: 'deal',
  TICKET: 'ticket',
  TASK: 'task',
  PIPELINE_LABEL: 'pipelineLabel',
  PIPELINE_TEMPLATE: 'pipelineTemplate',
  GROWTH_HACK: 'growthHack'
};
