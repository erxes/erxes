export const NOW = new Date();

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

export const KIND_MAP = {
  messenger: "Messenger",
  lead: "Popups & forms",
  webhook: "Webhook",
  callpro: "Callpro",
  imap: "IMap",
  "facebook-messenger": "Facebook messenger",
  "facebook-post": "Facebook post",
  "instagram-messenger": "Instagram messenger",
  calls: "Phone call",
  client: "Client Portal",
  vendor: "Vendor Portal"
}

export const CUSTOMERS_OPTIONS = [
  { label: 'First name', value: 'firstName' },
  { label: 'Last name', value: 'lastName' },
  { label: 'Pronoun', value: 'pronoun' },
  { label: 'Position', value: 'position' },
  { label: 'Department', value: 'department' },
  { label: 'Email verification status', value: 'emailValidationStatus' },
  { label: 'Phone verification status', value: 'phoneValidationStatus' },
  { label: 'Last Seen At', value: 'lastSeenAt' },
  { label: 'Birthday', value: 'birthDate' },
  { label: 'Integration', value: 'integration' },
  { label: 'Source', value: 'source' },
  { label: 'Companies', value: 'company' },
]

export const COMPANIES_OPTIONS = [
  { label: 'Primary name', value: 'primaryName' },
  { label: 'Industry', value: 'industry' },
  { label: 'Business Type', value: 'businessType' },
  { label: 'Owned By', value: 'owner' },
  { label: 'Customers', value: 'customer' },
]

export const DIMENSION_OPTIONS = [
  { label: 'Primary email', value: 'primaryEmail' },
  { label: 'Primary phone', value: 'primaryPhone' },
  { label: 'Code', value: 'code' },
  { label: 'Subscribe', value: 'isSubscribed' },
  { label: 'Description', value: 'description' },
  { label: 'Created At', value: 'createdAt' },
  { label: 'Modified At', value: 'modifiedAt' },
  { label: 'Tags', value: 'tag' },
  { label: 'Status', value: 'status' },
  { label: 'Frequency (day, week, month)', value: 'frequency' },
  { label: 'Custom Properties', value: 'field' },
  { label: 'Cars', value: 'car' },
];

export const MEASURE_OPTIONS = [
  { label: 'Total count', value: 'count' }
];

export const CUSTOM_DATE_FREQUENCY_TYPES = [
  { label: 'By week', value: '%Y-%V' },
  { label: 'By month', value: '%m' },
  { label: 'By year', value: '%Y' },
  { label: 'By date', value: '%Y-%m-%d' },
  { label: 'By date-time', value: '%Y-%m-%d %H:%M:%S' }
];

export const DATERANGE_TYPES = [
  { label: "All time", value: "all" },
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "This Week", value: "thisWeek" },
  { label: "Last Week", value: "lastWeek" },
  { label: "This Month", value: "thisMonth" },
  { label: "Last Month", value: "lastMonth" },
  { label: "This Year", value: "thisYear" },
  { label: "Last Year", value: "lastYear" },
  { label: "Custom Date", value: "customDate" }
];

export const CONTACT_STATES = {
  lead: "Lead",
  customer: "Customer",
  company: "Company",
  visitor: "Visitor",
  client: "Client Portal",
  vendor: "Vendor Portal"
};

export const CONTACT_STATE_TYPES = [
  { label: "Lead", value: "lead" },
  { label: "Customer", value: "customer" },
  { label: "Company", value: "company" },
  { label: "Visitor", value: "visitor" },
  { label: "Client Portal", value: "client" },
  { label: "Vendor Portal", value: "vendor" }
];

export const BUSINESSPORTAL_STATE_TYPES = [
  { label: "Customer", value: "customer" },
  { label: "Company", value: "company" }
];

export const INTEGRATION_TYPES = [
  { label: "XOS Messenger", value: "messenger" },
  { label: "Email", value: "email" },
  { label: "Call", value: "calls" },
  { label: "Callpro", value: "callpro" },
  { label: "SMS", value: "sms" },
  { label: "Facebook Messenger", value: "facebook-messenger" },
  { label: "Facebook Post", value: "facebook-post" }
];

export const DATERANGE_BY_TYPES = [
  { label: "Created At", value: "createdAt" },
  { label: "Modified At", value: "modifiedAt" },
  { label: "Date Of Birth", value: "birthDate" },
  { label: "Last Seen At", value: "lastSeenAt" }
];

export const DATERANGE_BY_TYPES_COMPANIES = [
  { label: "Created At", value: "createdAt" },
  { label: "Modified At", value: "modifiedAt" }
];

export const GENDER_CHOICES = {
  1: "Male",
  2: "Female"
}