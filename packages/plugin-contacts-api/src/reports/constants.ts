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

export const CONTACT_STATES = {
    lead: "Lead",
    customer: "Customer",
    company: "Company",
    visitor: "Visitor",
    'client': "Client Portal",
    'vendor': "Vendor Portal"
}

export const CONTACT_STATE_TYPES = [
    { label: 'Lead', value: 'lead' },
    { label: 'Customer', value: 'customer' },
    { label: 'Company', value: 'company' },
    { label: 'Visitor', value: 'visitor' },
    { label: 'Client Portal', value: 'client-portal' },
    { label: 'Vendor Portal', value: 'vendor-portal' },
];

export const BUSINESSPORTAL_STATE_TYPES = [
    { label: 'Customer', value: 'customer' },
    { label: 'Company', value: 'company' }
];

export const INTEGRATION_TYPES = [
    { label: 'XOS Messenger', value: 'messenger' },
    { label: 'Email', value: 'email' },
    { label: 'Call', value: 'calls' },
    { label: 'Callpro', value: 'callpro' },
    { label: 'SMS', value: 'sms' },
    { label: 'Facebook Messenger', value: 'facebook-messenger' },
    { label: 'Facebook Post', value: 'facebook-post' },
];