import { type ConditionGroup, RecordFilter } from '@erxes/core-contract';
import { callerUserId, users } from '@erxes/core-db';
import { compileFilter, type FilterFields, invalidFilter } from '@erxes/plugin-sdk/filter';

/**
 * What the team members list filters by: the paths its `ListFilter` fields name
 * (`apps/web/src/modules/settings/team-members/header/useMemberFilterFields.ts`).
 */
const USER_FILTER_FIELDS: FilterFields = {
  'subject.fullName': { type: 'text', expr: users.fullName, label: 'Name' },
  'subject.email': { type: 'text', expr: users.email, label: 'Email' },
  'subject.phone': { type: 'text', expr: users.phone, label: 'Phone' },
  'subject.employeeId': { type: 'text', expr: users.employeeId, label: 'Employee id' },
  'subject.role': { type: 'select', expr: users.role, label: 'Role' },
  'subject.status': { type: 'select', expr: users.status, label: 'Status' },
  'subject.canSignIn': { type: 'boolean', expr: users.canSignIn, label: 'Signs in' },
  'subject.birthDate': { type: 'date', expr: users.birthDate, label: 'Birthday', dateOnly: true },
  'subject.workStartedDate': {
    type: 'date',
    expr: users.workStartedDate,
    label: 'Joined',
    dateOnly: true,
  },
  'subject.createdAt': { type: 'date', expr: users.createdAt, label: 'Added' },
};

/** The list's `filter` (JSON of a condition group) as SQL on the users; 400 `INVALID_FILTER` when it doesn't fit. */
export const compileUserFilter = (filter: string | undefined) => {
  if (!filter) return undefined;

  let group: ConditionGroup;

  try {
    group = RecordFilter.parse(JSON.parse(filter));
  } catch {
    throw invalidFilter('The filter is not a valid condition group');
  }

  return compileFilter(USER_FILTER_FIELDS, group, { me: callerUserId() });
};
