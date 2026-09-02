import { SegmentField, SegmentFieldMeta } from 'erxes-api-shared/core-modules';

export const CONTACT_SEGMENT_FIELDS: SegmentFieldMeta[] = [
  SegmentField.static({
    key: 'state',
    label: 'State',
    options: ['visitor', 'lead', 'customer'],
  }),
  SegmentField.static({
    key: 'status',
    label: 'Status',
    options: ['Active', 'deleted'],
  }),

  SegmentField.text({ key: 'firstName', label: 'First name' }),
  SegmentField.text({ key: 'lastName', label: 'Last name' }),
  SegmentField.text({ key: 'middleName', label: 'Middle name' }),
  SegmentField.text({ key: 'primaryEmail', label: 'Primary email' }),
  SegmentField.text({ key: 'primaryPhone', label: 'Primary phone' }),
  SegmentField.text({ key: 'primaryAddress', label: 'Primary address' }),
  SegmentField.text({ key: 'code', label: 'Code' }),
  SegmentField.text({ key: 'description', label: 'Description' }),
  SegmentField.text({ key: 'position', label: 'Position' }),
  SegmentField.text({ key: 'department', label: 'Department' }),
  SegmentField.text({ key: 'avatar', label: 'Avatar' }),
  SegmentField.text({ key: 'sex', label: 'Sex' }),
  SegmentField.text({ key: 'leadStatus', label: 'Lead status' }),
  SegmentField.text({
    key: 'emailValidationStatus',
    label: 'Email validation status',
  }),
  SegmentField.text({
    key: 'phoneValidationStatus',
    label: 'Phone validation status',
  }),
  SegmentField.text({ key: 'integrationId', label: 'Integration' }),
  SegmentField.text({
    key: 'relatedIntegrationIds',
    label: 'Related integrations',
  }),

  SegmentField.text({ key: 'location.country', label: 'Country' }),
  SegmentField.text({ key: 'location.city', label: 'City' }),
  SegmentField.text({ key: 'location.region', label: 'Region' }),
  SegmentField.text({ key: 'location.hostname', label: 'Host name' }),
  SegmentField.text({ key: 'location.language', label: 'Language' }),
  SegmentField.text({
    key: 'visitorContactInfo.email',
    label: 'Visitor email',
  }),
  SegmentField.text({
    key: 'visitorContactInfo.phone',
    label: 'Visitor phone',
  }),

  SegmentField.number({ key: 'sessionCount', label: 'Session count' }),
  SegmentField.number({ key: 'score', label: 'Score' }),

  SegmentField.boolean({ key: 'isOnline', label: 'Is online' }),
  SegmentField.boolean({ key: 'isSubscribed', label: 'Is subscribed' }),
  SegmentField.boolean({ key: 'hasAuthority', label: 'Has authority' }),
  SegmentField.boolean({ key: 'doNotDisturb', label: 'Do not disturb' }),

  SegmentField.date({ key: 'birthDate', label: 'Birth date' }),
  SegmentField.date({ key: 'createdAt', label: 'Created at' }),
  SegmentField.date({ key: 'lastSeenAt', label: 'Last seen at' }),
  SegmentField.date({ key: 'updatedAt', label: 'Modified at' }),

  SegmentField.lookup({
    key: 'tagIds',
    label: 'Tags',
    query: { name: 'tags', labelField: 'name' },
  }),
  SegmentField.lookup({
    key: 'ownerId',
    label: 'Owner',
    query: { name: 'users', labelField: 'email' },
  }),
];
