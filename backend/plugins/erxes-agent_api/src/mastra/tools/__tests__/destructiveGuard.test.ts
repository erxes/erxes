import {
  isDestructiveOperation,
  resolveDestructiveOpsPolicy,
  isApprovedOperation,
  destructiveApprovalRequiredResult,
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

  it("defaults to 'ask' for missing, invalid, or legacy configs", () => {
    expect(resolveDestructiveOpsPolicy({ destructiveOps: 'block' })).toBe('ask');
    expect(resolveDestructiveOpsPolicy({})).toBe('ask');
    expect(resolveDestructiveOpsPolicy(null)).toBe('ask');
    expect(resolveDestructiveOpsPolicy({ destructiveOps: 'yes' })).toBe('ask');
  });
});

describe('isApprovedOperation', () => {
  it('matches the exact operation + args the user approved', () => {
    const approved = [{ operation: 'customersRemove', args: { id: '1' } }];
    expect(isApprovedOperation('customersRemove', { id: '1' }, approved)).toBe(
      true,
    );
  });

  it('matches regardless of arg key order', () => {
    const approved = [{ operation: 'dealsRemove', args: { a: 1, b: 2 } }];
    expect(isApprovedOperation('dealsRemove', { b: 2, a: 1 }, approved)).toBe(
      true,
    );
  });

  it('does not match a different operation, different args, or empty list', () => {
    const approved = [{ operation: 'customersRemove', args: { id: '1' } }];
    expect(isApprovedOperation('dealsRemove', { id: '1' }, approved)).toBe(
      false,
    );
    expect(isApprovedOperation('customersRemove', { id: '2' }, approved)).toBe(
      false,
    );
    expect(isApprovedOperation('customersRemove', { id: '1' }, [])).toBe(false);
    expect(
      isApprovedOperation('customersRemove', { id: '1' }, undefined),
    ).toBe(false);
  });
});

describe('destructiveApprovalRequiredResult', () => {
  it('asks for approval, carries the op + args, and is non-retryable', () => {
    const result = destructiveApprovalRequiredResult('customersRemove', {
      id: '1',
    });
    expect(result.success).toBe(false);
    expect(result.requiresApproval).toBe(true);
    expect(result.operation).toBe('customersRemove');
    expect(result.args).toEqual({ id: '1' });
    expect(result.instruction).toMatch(/do not retry/i);
  });
});
