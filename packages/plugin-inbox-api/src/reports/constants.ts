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
    { label: 'Departments', value: 'department' },
    { label: 'Branches', value: 'branch' },
    { label: 'Source', value: 'source' },
    { label: 'Channel', value: 'channel' },
    { label: 'Brands', value: 'brand' },
    { label: 'Tags', value: 'tag' },
    { label: 'Frequency (day, week, month)', value: 'frequency' },
    { label: 'Status', value: 'status' },
    { label: 'First responded by', value: 'firstRespondedBy' },
    { label: 'Assigned to', value: 'assignedTo' },
    { label: 'Resolved by', value: 'resolvedBy' },
    { label: 'Created at', value: 'createdAt' },
    { label: 'Updated at', value: 'updatedAt' },
    { label: 'Closed at', value: 'closedAt' },
    { label: 'First responded at', value: 'firstRespondedAt' },
    { label: 'Content', value: 'content' },
    { label: 'Message count', value: 'messageCount' },
];

export const MEASURE_OPTIONS = [
    { label: 'Count', value: 'count' },
    { label: 'Average time to response', value: 'averageResponseTime' },
    { label: 'Average time to close', value: 'averageCloseTime' }
];

export const MEASURE_LABELS = {
    'count': 'Total Count',
    'averageResponseTime': 'Average Time To Response',
    'averageCloseTime': 'Average Time To Close',
}

export const STATUS_LABELS = {
    "engageVisitorAuto": "Auto-Engaged",
    "open": "Open",
    "new": "New",
    "closed": "Resolved",
}

export const KIND_MAP = {
    messenger: 'Messenger',
    lead: 'Popups & forms',
    webhook: 'Webhook',
    callpro: 'Callpro',
    imap: 'IMap',
    'facebook-messenger': 'Facebook messenger',
    'facebook-post': 'Facebook post',
    'instagram-messenger': 'Instagram messenger',
    calls: 'Phone call',
    client: 'Client Portal',
    vendor: 'Vendor Portal',
    'nylas-imap': 'Nylas IMap',
    'smooch-twilio': 'Smooch Twilio',
}

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

export const INBOX_TAG_TYPE = 'inbox:conversation';

export const CUSTOM_DATE_FREQUENCY_TYPES = [
    { label: 'By week', value: '%Y-%V' },
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

export const USER_TYPES = [
    { label: 'Assigned To', value: 'assignedUserId' },
    { label: 'Resolved By', value: 'closedUserId' },
    { label: 'First Responded By', value: 'firstRespondedUserId' },
];