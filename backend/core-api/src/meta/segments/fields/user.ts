import {
  booleanField,
  dateField,
  SegmentFieldMeta,
  textField,
} from 'erxes-api-shared/core-modules';

export const USER_SEGMENT_FIELDS: SegmentFieldMeta[] = [
  textField({ key: 'email', label: 'Email' }),
  textField({ key: 'username', label: 'Username' }),
  textField({ key: 'code', label: 'Code' }),

  textField({ key: 'details.fullName', label: 'Full name' }),
  textField({ key: 'details.firstName', label: 'First name' }),
  textField({ key: 'details.lastName', label: 'Last name' }),
  textField({ key: 'details.position', label: 'Position' }),
  textField({ key: 'details.avatar', label: 'Avatar' }),
  textField({ key: 'branchIds', label: 'Branches' }),
  textField({ key: 'departmentIds', label: 'Departments' }),
  textField({ key: 'positionIds', label: 'Positions' }),
  textField({ key: 'brandIds', label: 'Brands' }),

  booleanField({ key: 'isActive', label: 'Is active' }),
  booleanField({ key: 'isOwner', label: 'Is owner' }),
  booleanField({ key: 'isOnboarded', label: 'Is onboarded' }),
  booleanField({
    key: 'getNotificationByEmail',
    label: 'Get notification by email',
  }),

  dateField({ key: 'createdAt', label: 'Created at' }),
];
