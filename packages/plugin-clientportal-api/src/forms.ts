import { CLIENTPORTALUSER_BASIC_INFO } from './constants';
import { generateFields } from './utils';

export default {
  types: [
    {
      description: 'Client Portal User',
      type: 'user'
    }
  ],
  fields: generateFields,
  defaultColumnsConfig: {
    user: [
      { name: 'email', label: 'Email', order: 1 },
      { name: 'phone', label: 'Phone', order: 2 },
      { name: 'username', label: 'User name', order: 3 },
      { name: 'firstName', label: 'First name', order: 4 },
      { name: 'lastName', label: 'Last name', order: 5 },
      { name: 'companyName', label: 'Company name', order: 6 },
      {
        name: 'companyRegistrationNumber',
        label: 'Company registration number',
        order: 7
      },
      {
        name: 'avatar',
        label: 'Avatar',
        order: 8
      }
    ]
  },
  systemFields: ({ data: { groupId } }) =>
    CLIENTPORTALUSER_BASIC_INFO.ALL.map(e => ({
      text: e.label,
      type: e.field,
      groupId,
      contentType: `clientportal:user`,
      isDefinedByErxes: true
    })),
  systemFieldsAvailable: true
};
