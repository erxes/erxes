import {
  booleanField,
  dateField,
  lookupField,
  numberField,
  SegmentFieldMeta,
  staticField,
  textField,
} from 'erxes-api-shared/core-modules';

export const CONTACT_SEGMENT_FIELDS: SegmentFieldMeta[] = [
  staticField({
    key: 'state',
    label: 'State',
    options: ['visitor', 'lead', 'customer'],
  }),
  staticField({
    key: 'status',
    label: 'Status',
    options: ['Active', 'deleted'],
  }),

  textField({ key: 'firstName', label: 'First name' }),
  textField({ key: 'lastName', label: 'Last name' }),
  textField({ key: 'middleName', label: 'Middle name' }),
  textField({ key: 'primaryEmail', label: 'Primary email' }),
  textField({ key: 'primaryPhone', label: 'Primary phone' }),
  textField({ key: 'primaryAddress', label: 'Primary address' }),
  textField({ key: 'code', label: 'Code' }),
  textField({ key: 'description', label: 'Description' }),
  textField({ key: 'position', label: 'Position' }),
  textField({ key: 'department', label: 'Department' }),
  textField({ key: 'avatar', label: 'Avatar' }),
  textField({ key: 'sex', label: 'Sex' }),
  textField({ key: 'leadStatus', label: 'Lead status' }),
  textField({ key: 'emailValidationStatus', label: 'Email validation status' }),
  textField({ key: 'phoneValidationStatus', label: 'Phone validation status' }),
  textField({ key: 'integrationId', label: 'Integration' }),
  textField({ key: 'relatedIntegrationIds', label: 'Related integrations' }),

  textField({ key: 'location.country', label: 'Country' }),
  textField({ key: 'location.city', label: 'City' }),
  textField({ key: 'location.region', label: 'Region' }),
  textField({ key: 'location.hostname', label: 'Host name' }),
  textField({ key: 'location.language', label: 'Language' }),
  textField({ key: 'visitorContactInfo.email', label: 'Visitor email' }),
  textField({ key: 'visitorContactInfo.phone', label: 'Visitor phone' }),

  numberField({ key: 'sessionCount', label: 'Session count' }),
  numberField({ key: 'score', label: 'Score' }),

  booleanField({ key: 'isOnline', label: 'Is online' }),
  booleanField({ key: 'isSubscribed', label: 'Is subscribed' }),
  booleanField({ key: 'hasAuthority', label: 'Has authority' }),
  booleanField({ key: 'doNotDisturb', label: 'Do not disturb' }),

  dateField({ key: 'birthDate', label: 'Birth date' }),
  dateField({ key: 'createdAt', label: 'Created at' }),
  dateField({ key: 'lastSeenAt', label: 'Last seen at' }),
  dateField({ key: 'updatedAt', label: 'Modified at' }),

  lookupField({
    key: 'tagIds',
    label: 'Tags',
    query: { name: 'tags', labelField: 'name' },
  }),
  lookupField({
    key: 'ownerId',
    label: 'Owner',
    query: { name: 'users', labelField: 'email' },
  }),
];
