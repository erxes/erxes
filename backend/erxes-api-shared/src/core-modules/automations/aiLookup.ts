import { TAutomationFindObjectTargetDefinition } from './types';

// What an AI agent may see of a looked-up record: the target's declared
// output only, never the stored document.
export const projectLookupRecord = (
  target: TAutomationFindObjectTargetDefinition,
  record: Record<string, unknown> | null,
) => {
  if (!record) {
    return null;
  }

  const keys = (target.output?.variables || []).map(({ key }) => key);

  return Object.fromEntries(
    keys
      .filter((key) => record[key] !== undefined)
      .map((key) => [key, record[key]]),
  );
};

// Organization data, not any customer's own record
export const isPublicLookup = (target: TAutomationFindObjectTargetDefinition) =>
  !!target.lookup && !target.lookup.customerField;

// A record of another customer must read exactly like a missing one
export const belongsToLookupCustomer = (
  target: TAutomationFindObjectTargetDefinition,
  record: Record<string, unknown> | null,
  customerId: string,
) =>
  !!customerId &&
  !!record &&
  !!target.lookup?.customerField &&
  String(record[target.lookup.customerField] ?? '') === customerId;
