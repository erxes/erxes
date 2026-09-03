import { SegmentField, SegmentFieldMeta } from 'erxes-api-shared/core-modules';

export const USER_SEGMENT_FIELDS: SegmentFieldMeta[] = [
  SegmentField.text({ key: 'email', label: 'Email' }),
  SegmentField.text({ key: 'username', label: 'Username' }),
  SegmentField.text({ key: 'code', label: 'Code' }),

  SegmentField.text({ key: 'details.fullName', label: 'Full name' }),
  SegmentField.text({ key: 'details.firstName', label: 'First name' }),
  SegmentField.text({ key: 'details.lastName', label: 'Last name' }),
  SegmentField.text({ key: 'details.position', label: 'Position' }),
  SegmentField.text({ key: 'details.avatar', label: 'Avatar' }),
  SegmentField.text({ key: 'branchIds', label: 'Branches' }),
  SegmentField.text({ key: 'departmentIds', label: 'Departments' }),
  SegmentField.text({ key: 'positionIds', label: 'Positions' }),
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
