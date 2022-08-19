import { generateFields, generateSystemFields } from './utils';

export default {
  types: [
    {
      description: 'Customers',
      type: 'customer'
    },
    {
      description: 'Companies',
      type: 'company'
    },
    {
      description: 'Device properties',
      type: 'device'
    }
  ],
  fields: generateFields,
  defaultColumnsConfig: {
    customer: [
      { name: 'location.country', label: 'Country', order: 0 },
      { name: 'firstName', label: 'First name', order: 1 },
      { name: 'lastName', label: 'Last name', order: 2 },
      { name: 'primaryEmail', label: 'Primary email', order: 3 },
      { name: 'lastSeenAt', label: 'Last seen at', order: 4 },
      { name: 'sessionCount', label: 'Session count', order: 5 },
      { name: 'profileScore', label: 'Profile score', order: 6 },
      { name: 'middleName', label: 'Middle name', order: 7 },
      { name: 'score', label: 'Score', order: 8 }
    ],
    company: [
      { name: 'primaryName', label: 'Primary Name', order: 1 },
      { name: 'size', label: 'Size', order: 2 },
      { name: 'links.website', label: 'Website', order: 3 },
      { name: 'industry', label: 'Industries', order: 4 },
      { name: 'plan', label: 'Plan', order: 5 },
      { name: 'lastSeenAt', label: 'Last seen at', order: 6 },
      { name: 'sessionCount', label: 'Session count', order: 7 },
      { name: 'score', label: 'Score', order: 8 }
    ]
  },
  systemFields: generateSystemFields
};
