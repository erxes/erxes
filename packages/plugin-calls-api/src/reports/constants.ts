export const CALL_TYPES = [
  { label: 'Incoming', value: 'incoming' },
  { label: 'Outgoing', value: 'outgoing' },
];

export const CALL_ENDED_BY = [
  { label: 'Customer', value: 'remote' },
  { label: 'Operator', value: 'local' },
];

export const CALL_STATUS = [
  { label: 'Answered', value: 'connected' },
  { label: 'Active', value: 'active' },
  { label: 'Missed', value: 'cancelled' },
  { label: 'Transferred', value: 'transferred' },
];

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

export const CALL_STATUS_LABELS = {
  incoming: 'Incoming',
  outgoing: 'Outgoing',
  remote: 'Customer',
  local: 'Operator',
  connected: 'Answered',
  active: 'Active',
  cancelled: 'Missed',
  transferred: 'Transferred',
};

export const CALL_DIMENSION = [
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

export const CALL_MEASURE = [
  { label: 'Total count', value: 'count' },
  { label: 'Total duration', value: 'totalDuration' },
  { label: 'Average duration', value: 'averageDuration' },
];

export const DIMENSION_MAP = {
  teamMember: [
    { group: '$createdBy' },
    {
      lookup: {
        from: 'users',
        let: { fieldId: '$_id.teamMember' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$_id', '$$fieldId'] },
                  { $eq: ['$isActive', true] },
                ],
              },
            },
          },
        ],
        as: 'user',
      },
    },
    { unwind: '$user' },
    { project: '$user' },
  ],
  type: [
    { match: { callType: { $ne: null } } },
    { group: '$callType' },
    { project: '$_id.type' },
  ],
  status: [
    { match: { callStatus: { $ne: null } } },
    { group: '$callStatus' },
    { project: '$_id.status' },
  ],
  endedBy: [
    { match: { endedBy: { $ne: null } } },
    { group: '$endedBy' },
    { project: '$_id.endedBy' },
  ],
  queue: [
    { match: { queueName: { $ne: null } } },
    { group: '$queueName' },
    { project: '$_id.queue' },
  ],
  operator: [
    { match: { operatorPhone: { $ne: null } } },
    { group: '$operatorPhone' },
    { project: '$_id.operator' },
  ],
  customer: [
    { match: { customerPhone: { $ne: null } } },
    { group: '$customerPhone' },
    { project: '$_id.customer' },
  ],
  brand: [
    { match: { inboxIntegrationId: { $ne: null } } },
    {
      lookup: {
        from: 'integrations',
        localField: 'inboxIntegrationId',
        foreignField: '_id',
        as: 'integration',
      },
    },
    { unwind: '$integration' },
    { group: '$integration.brandId' },
    {
      lookup: {
        from: 'brands',
        localField: '_id.brand',
        foreignField: '_id',
        as: 'brand',
      },
    },
    { unwind: '$brand' },
    { project: '$brand.name' },
  ],
  channel: [
    { match: { inboxIntegrationId: { $ne: null } } },
    { group: '$inboxIntegrationId' },
    {
      lookup: {
        from: 'channels',
        localField: '_id.channel',
        foreignField: 'integrationIds',
        as: 'channel',
      },
    },
    { unwind: '$channel' },
    { project: '$channel.name' },
  ],
  integration: [
    { match: { inboxIntegrationId: { $ne: null } } },
    { group: '$inboxIntegrationId' },
    {
      lookup: {
        from: 'integrations',
        localField: '_id.integration',
        foreignField: '_id',
        as: 'integration',
      },
    },
    { unwind: '$integration' },
    { project: '$integration.name' },
  ],
};
