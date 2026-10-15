import { isRecord } from '@/loyalties/utils/isRecord';

export const BIRTHDAY_AUTO_ISSUE_KIND = 'birthday';

export const CUSTOMER_CONTENT_TYPE = 'core:contacts.customers';

// Mirrors erxes-api-shared's AUTOMATION_SEGMENT_MEMBERSHIP_EVENT.
export const SEGMENT_MEMBERSHIP_EVENT = 'segmentMembership';

export const ISSUE_VOUCHER_ACTION = {
  type: 'loyalty:voucher.voucher.create',
  label: 'Issue voucher',
  description: 'Issue a voucher',
  icon: 'IconTagPlus',
};

const BIRTHDAY_CONDITION = {
  kind: 'field',
  contentType: CUSTOMER_CONTENT_TYPE,
  fieldKey: 'birthDate',
  // Day and month in any year, re-checked every night.
  operator: 'annt',
};

export const BIRTHDAY_SEGMENT_ROOT = {
  kind: 'group',
  conjunction: 'and',
  children: [BIRTHDAY_CONDITION],
};

/** A segment of exactly "birthday today", whoever made it. */
export const isBirthdaySegmentRoot = (root: unknown) => {
  if (
    !isRecord(root) ||
    root.kind !== 'group' ||
    !Array.isArray(root.children)
  ) {
    return false;
  }

  const [only, ...rest] = root.children;

  return (
    !rest.length &&
    isRecord(only) &&
    only.kind === BIRTHDAY_CONDITION.kind &&
    only.contentType === BIRTHDAY_CONDITION.contentType &&
    only.fieldKey === BIRTHDAY_CONDITION.fieldKey &&
    only.operator === BIRTHDAY_CONDITION.operator
  );
};
