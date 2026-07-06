import { TRecordReferencesConfig } from 'erxes-api-shared/core-modules';

export const TICKET_REFERENCE_TYPES: TRecordReferencesConfig['types'] = [
  {
    type: 'ticket',
    label: 'Ticket',
    fields: [
      { key: 'displayName', label: 'Display name', path: 'name' },
      { key: '_id', label: 'Ticket ID' },
      { key: 'name', label: 'Name' },
      {
        key: 'customers',
        label: 'Customers',
        reference: {
          type: 'core:customer',
          kind: 'relation',
          relType: 'customer',
        },
      },
      {
        key: 'deals',
        label: 'Deals',
        reference: {
          type: 'sales:deal',
          kind: 'relation',
          relType: 'deal',
        },
      },
    ],
  },
];
