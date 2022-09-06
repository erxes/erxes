export const schemaTypes = ['Customers', 'Deals', 'Conversations'];

export const CHART_TYPES = [
  {
    name: 'line',
    title: 'Line',
    icon: 'line-chart'
  },
  {
    name: 'area',
    title: 'Area',
    icon: 'area-chart'
  },
  {
    name: 'bar',
    title: 'Bar',
    icon: 'bar-chart'
  },
  {
    name: 'pie',
    title: 'Pie',
    icon: 'pie-chart'
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

export const DATE_RANGES = [
  {
    title: 'All time',
    value: 'All time',
    exceludedGranularities: ['Second', 'Minute', 'Hour', 'Day']
  },
  {
    value: 'Today',
    exceludedGranularities: [
      'Second',
      'Minute',
      'Day',
      'Week',
      'Month',
      'Quarter',
      'Year'
    ]
  },
  {
    value: 'Yesterday',
    exceludedGranularities: [
      'Second',
      'Minute',
      'Week',
      'Month',
      'Quarter',
      'Year'
    ]
  },
  {
    value: 'This week',
    exceludedGranularities: [
      'Second',
      'Minute',
      'Week',
      'Month',
      'Quarter',
      'Year'
    ]
  },
  {
    value: 'This month',
    exceludedGranularities: [
      'Second',
      'Minute',
      'Hour',
      'Month',
      'Quarter',
      'Year'
    ]
  },
  {
    value: 'This quarter',
    exceludedGranularities: ['Second', 'Minute', 'Hour', 'Quarter', 'Year']
  },
  {
    value: 'This year',
    exceludedGranularities: ['Second', 'Minute', 'Hour', 'Year']
  },
  {
    value: 'Last 7 days',
    exceludedGranularities: [
      'Second',
      'Minute',
      'Week',
      'Month',
      'Quarter',
      'Year'
    ]
  },
  {
    value: 'Last 30 days',
    exceludedGranularities: [
      'Second',
      'Minute',
      'Hour',
      'Month',
      'Quarter',
      'Year'
    ]
  },
  {
    value: 'Last week',
    exceludedGranularities: [
      'Second',
      'Minute',
      'Week',
      'Month',
      'Quarter',
      'Year'
    ]
  },
  {
    value: 'Last month',
    exceludedGranularities: [
      'Second',
      'Minute',
      'Hour',
      'Month',
      'Quarter',
      'Year'
    ]
  },
  {
    value: 'Last quarter',
    exceludedGranularities: ['Second', 'Minute', 'Hour', 'Quarter', 'Year']
  },
  {
    value: 'Last year',
    exceludedGranularities: ['Second', 'Minute', 'Hour', 'Year']
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
