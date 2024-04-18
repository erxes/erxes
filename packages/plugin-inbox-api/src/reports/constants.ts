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

export const WEEKDAY_NAMES = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
]

export const DIMENSION_OPTIONS = [
    { label: 'Team members', value: 'teamMember' },
    { label: 'Departments', value: 'department' },
    { label: 'Branches', value: 'branch' },
    { label: 'Source/Channel', value: 'source' },
    { label: 'Brands', value: 'brand' },
    { label: 'Tags', value: 'tag' },
    { label: 'Frequency (day, week, month)', value: 'frequency' },
    { label: 'Status', value: 'status' },
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

export const DATERANGE_BY_TYPES = [
    { label: 'Created At', value: 'createdAt' },
    { label: 'Modified At', value: 'updatedAt' },
    { label: 'Closed At', value: 'closedAt' },
]

export const INTEGRATION_TYPES = [
    { label: 'XOS Messenger', value: 'messenger' },
    { label: 'Email', value: 'email' },
    { label: 'Call', value: 'calls' },
    { label: 'Callpro', value: 'callpro' },
    { label: 'SMS', value: 'sms' },
    { label: 'Facebook Messenger', value: 'facebook-messenger' },
    { label: 'Facebook Post', value: 'facebook-post' },
];

export const STATUS_KIND = {
    new: "New",
    open: "Open",
    closed: "Closed",
    engageVisitorAuto: "Auto-Engaged"
}

export const INBOX_TAG_TYPE = 'inbox:conversation';

export const CUSTOM_DATE_FREQUENCY_TYPES = [
    { label: 'By week', value: '%V' },
    { label: 'By month', value: '%m' },
    { label: 'By year', value: '%Y' },
    { label: 'By Date', value: '%Y-%m-%d' },
];

export const STATUS_TYPES = [
    { label: 'All', value: 'all' },
    { label: 'New', value: 'new' },
    { label: 'Open', value: 'open' },
    { label: 'Closed / Resolved', value: 'closed' },
    { label: 'Unassigned', value: 'unassigned' },
];