import {
  isDestructiveOperation,
  resolveDestructiveOpsPolicy,
  destructiveBlockedResult,
} from '../destructiveGuard';
import type { OperationMeta } from '../operationRegistry';

/** Minimal OperationMeta for the guard, which only reads name + type. */
const op = (
  operation: string,
  operationType: 'query' | 'mutation',
): OperationMeta => ({ operation, operationType }) as OperationMeta;

describe('isDestructiveOperation', () => {
  it('flags remove/delete/merge/destroy mutations', () => {
    for (const name of [
      'dealsRemove',
      'customersRemove',
      'customersMerge',
      'companiesMerge',
      'segmentsDelete',
      'conversationsRemove',
      'productsDestroy',
    ]) {
      expect(isDestructiveOperation(op(name, 'mutation'))).toBe(true);
    }
  });

  it('does not flag non-destructive mutations', () => {
    for (const name of [
      'dealsAdd',
      'customersEdit',
      'tasksAdd',
      'boardItemsArchive', // archive is the reversible, soft alternative
    ]) {
      expect(isDestructiveOperation(op(name, 'mutation'))).toBe(false);
    }
  });

  it('never flags queries, even when the name contains a destructive verb', () => {
    expect(isDestructiveOperation(op('customers', 'query'))).toBe(false);
    expect(isDestructiveOperation(op('removedCustomers', 'query'))).toBe(false);
  });
});

describe('resolveDestructiveOpsPolicy', () => {
  it("returns 'allow' only when explicitly set", () => {
    expect(resolveDestructiveOpsPolicy({ destructiveOps: 'allow' })).toBe(
      'allow',
    );
  });

  it("defaults to 'block' for missing, invalid, or legacy configs", () => {
    expect(resolveDestructiveOpsPolicy({ destructiveOps: 'block' })).toBe(
      'block',
    );
    expect(resolveDestructiveOpsPolicy({})).toBe('block');
    expect(resolveDestructiveOpsPolicy(null)).toBe('block');
    expect(resolveDestructiveOpsPolicy({ destructiveOps: 'yes' })).toBe(
      'block',
    );
  });
});

describe('destructiveBlockedResult', () => {
  it('is a structured, non-retryable refusal naming the operation', () => {
    const result = destructiveBlockedResult('customersRemove');
    expect(result.success).toBe(false);
    expect(result.blocked).toBe(true);
    expect(result.error).toContain('customersRemove');
    expect(result.instruction).toMatch(/do not retry/i);
  });
});
