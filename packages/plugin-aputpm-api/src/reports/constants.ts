export const NOW = new Date();

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const DIMENSION_OPTIONS = [
  { label: 'Team members', value: 'teamMember' },
  { label: 'Departments', value: 'department' },
  { label: 'Branches', value: 'branch' },
  { label: 'Source/Channel', value: 'source' },
  { label: 'Brands', value: 'brand' },
  { label: 'Tags', value: 'tag' },
  { label: 'Labels', value: 'label' },
  { label: 'Frequency (day, week, month)', value: 'frequency' },
  { label: 'Status', value: 'status' },
];

export const DATE_RANGE_TYPES = [
  { label: 'All time', value: 'all' },
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'Last 72h', value: 'last72h' },
  { label: 'This Week', value: 'thisWeek' },
  { label: 'Last Week', value: 'lastWeek' },
  { label: 'Last 2 Week', value: 'last2Week' },
  { label: 'Last 3 Week', value: 'last3Week' },
  { label: 'This Month', value: 'thisMonth' },
  { label: 'Last Month', value: 'lastMonth' },
  { label: 'This Year', value: 'thisYear' },
  { label: 'Last Year', value: 'lastYear' },
  { label: 'Custom Date', value: 'customDate' },
];

export const STAGE = [
  { label: 'Won', value: 'won' },
  { label: 'Lost', value: 'lost' },
  { label: 'Open', value: 'Open' },
  {
    label: 'All',
    value: 'All',
  },
];

export const DEVIATION_PIPELINE_TYPE = 'ticket';
export const ACTION_PIPELINE_TYPE = 'task';

export const DEVIATION_PIPELINES = [
  'Tag',
  'Safety Tag',
  'Issue',
  'Safety Issue',
];
export const ACTION_PIPELINES = ['Tag', 'Safety Tag', 'Safety Issue'];
