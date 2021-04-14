export const schemaTypes = [
  'Customers',
  'CustomerProperties',
  'Leads',
  'LeadProperties',
  'Visitors',
  'VisitorProperties',
  'Companies',
  'Conversations',
  'ConversationProperties',
  'Deals',
  'Tasks',
  'Tickets'
];

export const propertyTypes = [
  'ConversationProperties',
  'CustomerProperties',
  'LeadProperties',
  'VisitorProperties'
];

export const chartTypeWithoutDeminsions = [
  {
    name: 'line',
    title: 'Line',
    icon: 'chart-line'
  },
  {
    name: 'area',
    title: 'Area',
    icon: 'arrow-growth'
  },
  {
    name: 'bar',
    title: 'Bar',
    icon: 'chart-bar'
  },
  {
    name: 'number',
    title: 'Number',
    icon: 'info-circle'
  }
];

export const chartTypesWithDeminsions = [
  {
    name: 'bar',
    title: 'Bar',
    icon: 'chart-bar'
  },
  {
    name: 'pie',
    title: 'Pie',
    icon: 'chart-pie'
  },
  {
    name: 'table',
    title: 'Table',
    icon: 'table'
  },
  {
    name: 'number',
    title: 'Number',
    icon: 'info-circle'
  }
];

export const chartTypes = [
  {
    name: 'line',
    title: 'Line',
    icon: 'chart-line'
  },
  {
    name: 'area',
    title: 'Area',
    icon: 'arrow-growth'
  },
  {
    name: 'bar',
    title: 'Bar',
    icon: 'chart-bar'
  },
  {
    name: 'pie',
    title: 'Pie',
    icon: 'chart-pie'
  },
  {
    name: 'table',
    title: 'Table',
    icon: 'table'
  },
  {
    name: 'number',
    title: 'Number',
    icon: 'info-circle'
  },
  {
    name: 'number',
    title: 'Number',
    icon: 'info-circle'
  }
];

export const dateRanges = [
  {
    title: 'All time',
    value: undefined
  },
  {
    value: 'Today'
  },
  {
    value: 'Yesterday'
  },
  {
    value: 'This week'
  },
  {
    value: 'This month'
  },
  {
    value: 'This quarter'
  },
  {
    value: 'This year'
  },
  {
    value: 'Last 7 days'
  },
  {
    value: 'Last 30 days'
  },
  {
    value: 'Last week'
  },
  {
    value: 'Last month'
  },
  {
    value: 'Last quarter'
  },
  {
    value: 'Last year'
  }
];

export const chartColors = [
  '#6569DF',
  '#63D2D6',
  '#FF7C78',
  '#81CC49',
  '#7c2bba',
  '#d1a924',
  '#503b2c'
];

export const replaceTexts = [
  { name: 'nylas-gmail', value: 'gmail' },
  { name: 'nylas-imap', value: 'imap' },
  { name: 'nylas-exchange', value: 'exchange' },
  { name: 'nylas-outlook', value: 'outlook' },
  { name: 'nylas-yahoo', value: 'yahoo' },
  { name: 'smooch-twilio', value: 'twilio' }
];

export const ignoredFilters = [
  'createdDate',
  'modifiedDate',
  'birthDate',
  'iscomplete',
  'stageName',
  'closedDate',
  'updatedDate',
  'firstrespondeddate',
  'messagecount',
  'integrationKind',
  'firstRespondedDate',
  'firstName',
  'lastName',
  'customerFirstName',
  'customerLastName',
  'customerEmail',
  'CUSTOM'
];

export const ignoredMeasures = [
  'pipeline',
  'brand',
  'stageProbability',
  'createdDate',
  'modifiedDate',
  'birthDate',
  'closedDate',
  'updatedDate',
  'firstRespondedDate',
  'board',
  'integrationType',
  'ConversationProperties.integrationName',
  'ConversationProperties.tag',
  'ConversationProperties.integrationType'
];

export const complexFilters = [
  'Deals.board',
  'Deals.pipeline',
  'Tasks.board',
  'Tasks.pipeline',
  'Tickets.board',
  'Tickets.pipeline'
];
