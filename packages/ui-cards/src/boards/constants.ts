import { __ } from '@erxes/ui/src/utils';
export const STORAGE_BOARD_KEY = 'erxesCurrentBoardId';
export const STORAGE_PIPELINE_KEY = 'erxesCurrentPipelineId';

export const PRIORITIES = ['Critical', 'High', 'Normal', 'Low'];

export const TEXT_COLORS = [
  '#fff',
  '#fefefe',
  '#fafafa',
  '#ccc',
  '#ddd',
  '#888',
  '#444',
  '#333',
  '#222',
  '#000'
];

export const REMINDER_MINUTES = [
  { _id: '0', name: 'At Time of Due Date' },
  { _id: '5', name: '5 Minutes Before' },
  { _id: '10', name: '10 Minutes Before' },
  { _id: '15', name: '15 Minutes Before' },
  { _id: '60', name: '1 Hour Before' },
  { _id: '120', name: '2 Hour Before' },
  { _id: '1440', name: '1 Day Before' },
  { _id: '2880', name: '2 Day Before' }
];

export const PIPELINE_UPDATE_STATUSES = {
  START: __('start'),
  END: __('end'),
  NEW_REQUEST: __('newRequest')
};

export const EMPTY_CONTENT_DEAL = {
  title: __('Getting Started with Sales Pipeline'),
  description: __(
    `Drive leads to a successful close with our Kanban-style boards`
  ),
  steps: [
    {
      title: __('Create Boards and Pipelines'),
      description: `${__(
        'Track your entire sales pipeline from one dashboard'
      )}${__('You can also restrict access to your sales pipelines')}`,
      url: '/settings/boards/deal',
      urlText: __('Go to Board & Pipeline')
    },
    {
      title: __('Tip: Choose different views'),
      description: __(
        'Click on “Boards, Calendar, Conversions” to filter deals'
      ),
      icon: 'lightbulb-alt'
    }
  ]
};

export const EMPTY_CONTENT_TASK = {
  title: __('Getting Started with Tasks'),
  description: __(
    'Create a more collaborative, self-reliant and cross-linked team with our Kanban-style boards'
  ),
  steps: [
    {
      title: __('Create your first Task Board'),
      description: __(
        'Tip: This could be equivalent to your brands or you can organize by year/project/etc.'
      ),
      url: '/settings/boards/task',
      urlText: __('Go to Board & Pipeline')
    },
    {
      title: __('Tip: Filter'),
      description: __(
        'Click on “Show Menu” to filter tasks by assigned team members, customers, date, etc.'
      ),
      icon: 'lightbulb-alt'
    }
  ]
};

export const groupByList = [
  {
    name: 'stage',
    title: 'Stage'
  },
  {
    name: 'label',
    title: 'Label'
  },
  {
    name: 'priority',
    title: 'Priority'
  },
  {
    name: 'assignee',
    title: 'Assignee'
  },
  {
    name: 'dueDate',
    title: 'Due Date'
  }
];

export const groupByGantt = [
  {
    name: 'stage',
    title: 'Stage'
  },
  {
    name: 'label',
    title: 'Label'
  },
  {
    name: 'priority',
    title: 'Priority'
  },
  {
    name: 'assignee',
    title: 'Assignee'
  }
];

export const showByTime = [
  {
    name: 'stage',
    title: 'Stage'
  },
  {
    name: 'tags',
    title: 'Tags'
  },
  {
    name: 'members',
    title: 'Members'
  }
];

export const stackByChart = [
  {
    name: 'stage',
    title: 'Stage'
  },
  {
    name: 'label',
    title: 'Label'
  },
  {
    name: 'priority',
    title: 'Priority'
  },
  {
    name: 'dueDate',
    title: 'Due Date'
  }
];

export const chartTypes = [
  {
    name: 'line',
    title: 'Line Chart',
    icon: 'chart-line'
  },
  {
    name: 'area',
    title: 'Area Chart',
    icon: 'arrow-growth'
  },
  {
    name: 'simpleBar',
    title: 'Simple Bar Chart',
    icon: 'chart-bar'
  },
  {
    name: 'stackedBar',
    title: 'Stacked Bar Chart',
    icon: 'chart'
  }
];

export const SEARCH_ACTIVITY_CHECKBOX = [
  { action: 'create', value: 'added new card', title: 'Added new card' },
  { action: 'moved', value: 'moved card', title: 'Moved card' },
  { action: 'archive', value: 'archived card', title: 'Archived card' },
  {
    action: 'delete',
    value: 'deleted archived card',
    title: 'Deleted archived card'
  },
  { action: 'addNote', value: 'added notes on', title: 'Added notes' }
];

export const TYPES = {
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
  YEAR: 'year',
  all: ['day', 'week', 'month', 'year']
};

// type from growthHack
export const HACKSTAGES = [
  'Awareness',
  'Acquisition',
  'Activation',
  'Retention',
  'Revenue',
  'Referrals'
];
