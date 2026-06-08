export const PROBABILITY_OPEN = [
  '10%',
  '20%',
  '30%',
  '40%',
  '50%',
  '60%',
  '70%',
  '80%',
  '90%',
];

export const PROBABILITY_CLOSED = ['Won', 'Lost', 'Done', 'Resolved'];

export const PROBABILITY_DEAL = [
  { label: '10%', value: '10%' },
  { label: '20%', value: '20%' },
  { label: '30%', value: '30%' },
  { label: '40%', value: '40%' },
  { label: '50%', value: '50%' },
  { label: '60%', value: '60%' },
  { label: '70%', value: '70%' },
  { label: '80%', value: '80%' },
  { label: '90%', value: '90%' },
  { label: 'Won', value: 'Won' },
  { label: 'Lost', value: 'Lost' },
];

export const PROBABILITY_TASK = [
  { label: '10%', value: '10%' },
  { label: '20%', value: '20%' },
  { label: '30%', value: '30%' },
  { label: '40%', value: '40%' },
  { label: '50%', value: '50%' },
  { label: '60%', value: '60%' },
  { label: '70%', value: '70%' },
  { label: '80%', value: '80%' },
  { label: '90%', value: '90%' },
  { label: 'Done', value: 'Done' },
];

export const PROBABILITY_TICKET = [
  { label: '10%', value: '10%' },
  { label: '20%', value: '20%' },
  { label: '30%', value: '30%' },
  { label: '40%', value: '40%' },
  { label: '50%', value: '50%' },
  { label: '60%', value: '60%' },
  { label: '70%', value: '70%' },
  { label: '80%', value: '80%' },
  { label: '90%', value: '90%' },
  { label: 'Resolved', value: 'Resolved' },
];

export const DATERANGE_TYPES = [
  { label: 'All time', value: 'all' },
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'This Week', value: 'thisWeek' },
  { label: 'Last Week', value: 'lastWeek' },
  { label: 'Last 2 Week', value: 'last2Week' },
  { label: 'This Month', value: 'thisMonth' },
  { label: 'Last Month', value: 'lastMonth' },
  { label: 'This Year', value: 'thisYear' },
  { label: 'Last Year', value: 'lastYear' },
  { label: 'Custom Date', value: 'customDate' },
];

export const DATERANGE_BY_TYPES = [
  { label: 'Created At', value: 'createdAt' },
  { label: 'Modified At', value: 'modifiedAt' },
  { label: 'Stage Changed Date', value: 'stageChangedDate' },
  { label: 'Start Date', value: 'startDate' },
  { label: 'Close Date', value: 'closeDate' },
];

export const CUSTOM_DATE_FREQUENCY_TYPES = [
  { label: 'By week', value: '%Y-%V' },
  { label: 'By month', value: '%m' },
  { label: 'By year', value: '%Y' },
  { label: 'By date', value: '%Y-%m-%d' },
  { label: 'By date-time', value: '%Y-%m-%d %H:%M:%S' },
];

export const DUE_TYPES = [
  { label: 'Due', value: 'due' },
  { label: 'Overdue', value: 'overdue' },
];

export const DUE_DATERANGE_TYPES = [
  { label: 'Today', value: 'today' },
  { label: 'Within Week', value: 'thisWeek' },
  { label: 'Within Month', value: 'thisMonth' },
  { label: 'Within Year', value: 'thisYear' },
];

export const PRIORITY = [
  { label: 'Critical', value: 'Critical' },
  { label: 'High', value: 'High' },
  { label: 'Medium', value: 'Medium' },
  { label: 'Low', value: 'Low' },
];

export const ATTACHMENT_TYPES = [
  { label: 'Has attachment', value: true },
  { label: 'Has no attachment', value: false },
];

export const DIMENSION_OPTIONS = [
  { label: 'Team members', value: 'teamMember' },
  { label: 'Departments', value: 'department' },
  { label: 'Branches', value: 'branch' },
  { label: 'Companies', value: 'company' },
  { label: 'Customers', value: 'customer' },
  { label: 'Products', value: 'product' },
  { label: 'Boards', value: 'board' },
  { label: 'Pipelines', value: 'pipeline' },
  { label: 'Stages', value: 'stage' },
  { label: 'Tags', value: 'tag' },
  { label: 'Labels', value: 'label' },
  { label: 'Frequency (day, week, month)', value: 'frequency' },
  { label: 'Status', value: 'status' },
  { label: 'Priority', value: 'priority' },
];

export const MEASURE_OPTIONS = [
  { label: 'Total Count', value: 'count' },
  { label: 'Total Amount', value: 'amount' },
  { label: 'Average Amount', value: 'averageAmount' },
  { label: 'Total Time', value: 'time' },
  { label: 'Average Time', value: 'averageTime' },
  { label: 'Forecast', value: 'forecast' },
];

export const USER_TYPES = [
  { label: 'Created By', value: 'userId' },
  { label: 'Modified By', value: 'modifiedBy' },
  { label: 'Assigned To', value: 'assignedUserIds' },
];

export const STATUS_TYPES = [
  { label: 'Active', value: 'active' },
  { label: 'Archived', value: 'archived' },
  { label: 'Closed', value: 'closed' },
  { label: 'Open', value: 'open' },
];

export const INTEGRATION_OPTIONS = [
  { label: 'XOS Messenger', value: 'messenger' },
  { label: 'Email', value: 'email' },
  { label: 'Call', value: 'calls' },
  { label: 'Callpro', value: 'callpro' },
  { label: 'SMS', value: 'sms' },
  { label: 'Facebook Messenger', value: 'facebook-messenger' },
  { label: 'Facebook Post', value: 'facebook-post' },
];
