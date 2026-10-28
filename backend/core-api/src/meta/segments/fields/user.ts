import {
  SEGMENT_ID_OPERATORS,
  SEGMENT_IMPLICIT_OPERATORS,
  SegmentField,
  SegmentFieldMeta,
} from 'erxes-api-shared/core-modules';

export const USER_STRUCTURE_SEGMENT_FIELD = 'structureEntityIds';

export const USER_SEGMENT_FIELDS: SegmentFieldMeta[] = [
  SegmentField.text({ key: 'email', label: 'Email' }),
  SegmentField.text({ key: 'username', label: 'Username' }),
  SegmentField.text({ key: 'code', label: 'Code' }),

  SegmentField.text({ key: 'details.fullName', label: 'Full name' }),
  SegmentField.text({ key: 'details.firstName', label: 'First name' }),
  SegmentField.text({ key: 'details.lastName', label: 'Last name' }),
  SegmentField.text({ key: 'details.position', label: 'Position' }),
  SegmentField.text({ key: 'details.avatar', label: 'Avatar' }),
  {
    key: USER_STRUCTURE_SEGMENT_FIELD,
    label: 'Structure',
    operators: [...SEGMENT_ID_OPERATORS, ...SEGMENT_IMPLICIT_OPERATORS],
    kind: 'derived',
    dependsOn: [],
    input: 'select',
    source: 'query',
    query: { name: 'structureEntities', labelField: 'title' },
  },
  SegmentField.text({ key: 'brandIds', label: 'Brands' }),

  SegmentField.boolean({ key: 'isActive', label: 'Is active' }),
  SegmentField.boolean({ key: 'isOwner', label: 'Is owner' }),
  SegmentField.boolean({ key: 'isOnboarded', label: 'Is onboarded' }),
  SegmentField.boolean({
    key: 'getNotificationByEmail',
    label: 'Get notification by email',
  }),

  SegmentField.date({ key: 'createdAt', label: 'Created at' }),
];
