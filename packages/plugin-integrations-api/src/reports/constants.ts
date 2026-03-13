export const CALLPRO_STATE = [
  { label: 'Answered', value: 'ANSWERED' },
  { label: 'No Answer', value: 'NO Anwer' },
  { label: 'Incoming', value: 'INCOMING' },
  { label: 'Outgoing', value: 'OUTGOING' },
];

export const CALLPRO_ENDED_BY = [
  { label: 'Customer', value: 'remote' },
  { label: 'Operator', value: 'local' },
];

export const CALLPRO_TYPE = [
  { label: 'Incoming', value: 'INCOMING' },
  { label: 'Outgoing', value: 'OUTGOING' },
];

export const CALLPRO_STATUS = [
  { label: 'Answered', value: 'ANSWERED' },
  { label: 'No Answer', value: 'NO Anwer' },
];

export const CALLPRO_STATE_LABELS: Record<string, string> = {
  ANSWERED: 'Answered',
  'NO Anwer': 'No Answer',
  INCOMING: 'Incoming',
  OUTGOING: 'Outgoing',
  remote: 'Customer',
  local: 'Operator',
};

export const DATERANGE_TYPES = [
  { label: 'All time', value: 'all' },
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'This Week', value: 'thisWeek' },
  { label: 'Last Week', value: 'lastWeek' },
  { label: 'This Month', value: 'thisMonth' },
  { label: 'Last Month', value: 'lastMonth' },
  { label: 'This Year', value: 'thisYear' },
  { label: 'Last Year', value: 'lastYear' },
  { label: 'Custom Date', value: 'customDate' },
];

export const CUSTOM_DATE_FREQUENCY_TYPES = [
  { label: 'By week', value: '%Y-%V' },
  { label: 'By month', value: '%m' },
  { label: 'By year', value: '%Y' },
  { label: 'By date', value: '%Y-%m-%d' },
  { label: 'By date-time', value: '%Y-%m-%d %H:%M:%S' },
];

export const CALLPRO_DIMENSION = [
  { label: 'Team members', value: 'teamMember' },
  { label: 'Brand', value: 'brand' },
  { label: 'Channel', value: 'channel' },
  { label: 'Integration', value: 'integration' },
  { label: 'Ended By', value: 'endedBy' },
  { label: 'Operator', value: 'operator' },
  { label: 'Customer', value: 'customer' },
  { label: 'Status', value: 'status' },
  { label: 'Number', value: 'number' },
  { label: 'Queue', value: 'queue' },
  { label: 'Type', value: 'type' },
  { label: 'Date', value: 'createdAt' },
  { label: 'Frequency (day, week, month)', value: 'frequency' },
  { label: 'Record', value: 'record' },
];

export const CALLPRO_MEASURE = [
  { label: 'Total count', value: 'count' },
  { label: 'Total duration', value: 'totalDuration' },
  { label: 'Average duration', value: 'averageDuration' },
];
