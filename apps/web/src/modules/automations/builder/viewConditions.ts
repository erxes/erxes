import type { ConditionGroup, ConditionRule, View, ViewRecordType } from '@erxes/core-contract';

/** The lists whose views an automation on customers or companies can start from. */
export const VIEW_LISTS = {
  customer: ['customer', 'lead'],
  company: ['company', 'company_lead'],
} as const satisfies Record<'customer' | 'company', ViewRecordType[]>;

/**
 * A list shows only customers or only leads; an automation's record may be either, so the copy
 * says which.
 */
const stateOfList = (recordType: string) => {
  if (recordType === 'customer' || recordType === 'company') return 'customer';

  if (recordType === 'lead' || recordType === 'company_lead') return 'lead';

  return null;
};

/**
 * A saved view's filter as an automation's conditions: the same rules, and the state its list
 * implies ("customers", "leads"). A copy: later changes to the view don't reach the automation.
 */
export const conditionsFromView = (view: Pick<View, 'recordType' | 'filter'>): ConditionGroup => {
  const state = stateOfList(view.recordType);
  const rules = view.filter?.rules ?? [];

  const stateRule: ConditionRule[] = state
    ? [{ path: 'subject.state', op: 'eq', value: state }]
    : [];

  // "All of" rules join the state rule as they are; "any of" ones go in as one group.
  const copied = view.filter?.match === 'any' && rules.length > 1 ? [view.filter] : rules;

  return { match: 'all', rules: [...stateRule, ...copied] };
};
