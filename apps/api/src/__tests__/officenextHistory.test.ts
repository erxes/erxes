import { describe, expect, it } from 'vite-plus/test';
import { readEntry } from '../../scripts/officenext/activityLogs';
import { changeAudit, changesOf, logAudit, redact } from '../../scripts/officenext/auditLogs';

const names = {
  members: new Map([['u1', 'Bat Dorj']]),
  tags: new Map([['t1', 'VIP']]),
  segments: new Map([['s1', 'Active buyers']]),
};

/** An old activity entry as the importer reads it: every field, most of them empty. */
const entry = (fields: Record<string, unknown>) => ({
  id: 'a1',
  contentType: null,
  contentId: null,
  action: undefined,
  content: undefined,
  createdBy: null,
  activityType: null,
  targetType: null,
  targetId: null,
  actor: undefined,
  changes: undefined,
  metadata: undefined,
  createdAt: null,
  ...fields,
});

describe('officenext import: activity logs', () => {
  it('reads a 3.x entry onto the record it was about, in words', () => {
    const read = readEntry(
      entry({
        contentType: 'tasks:task',
        contentId: 'task1',
        action: 'assignee',
        createdBy: 'u9',
        content: { addedUserIds: ['u1'], removedUserIds: ['gone'] },
      }),
      names,
    );

    expect(read).toMatchObject({
      targetType: 'operation.task',
      oldId: 'task1',
      action: 'assignee',
      actorId: 'u9',
      summary: 'Assigned to Bat Dorj; Unassigned a removed record',
    });
  });

  it('reads a later entry by its target and description', () => {
    const read = readEntry(
      entry({
        targetType: 'core:contacts.customers',
        targetId: 'c1',
        activityType: 'segment.joined',
        action: { type: 'segment.joined', description: 'joined segment Session count =1' },
        actor: { _id: 'u1' },
      }),
      names,
    );

    expect(read).toMatchObject({
      targetType: 'customer',
      oldId: 'c1',
      actorId: 'u1',
      summary: 'joined segment Session count =1',
    });
  });

  it('has no timeline for member sign-ins, so they go to the audit log', () => {
    const read = readEntry(
      entry({ targetType: 'core:organization.users', targetId: 'u1', activityType: 'login' }),
      names,
    );

    expect(read.targetType).toBeNull();
  });
});

describe('officenext import: audit logs', () => {
  it('redacts secrets anywhere in an old document', () => {
    expect(redact({ name: 'Saraa', password: 'x', nested: [{ accessToken: 'y', ok: 1 }] })).toEqual(
      { name: 'Saraa', password: '[redacted]', nested: [{ accessToken: '[redacted]', ok: 1 }] },
    );
  });

  it('keeps only the fields that changed, as [before, after]', () => {
    expect(
      changesOf(
        { name: 'A', size: 1, updatedAt: 1 },
        { name: 'B', size: 1, updatedAt: 2, city: 'UB' },
      ),
    ).toEqual({ name: ['A', 'B'], city: [null, 'UB'] });
    expect(changesOf({ a: 1 }, { a: 1 })).toBeNull();
  });

  it('reads a 3.x log from its JSON text', () => {
    const old = logAudit({
      id: 'l1',
      type: 'contacts:customer',
      action: 'update',
      objectId: 'c1',
      createdBy: 'u1',
      description: '"Saraa" has been edited',
      oldData: '{"firstName":"Saraa"}',
      newData: '{"firstName":"Sara"}',
      addedData: undefined,
      removedData: undefined,
      extraDesc: '[]',
      createdAt: new Date('2021-01-02T00:00:00Z'),
    });

    expect(old).toMatchObject({
      type: 'contacts:customer',
      targetId: 'c1',
      changes: { firstName: ['Saraa', 'Sara'] },
    });
  });

  it('reads a change-stream entry, with its secrets redacted', () => {
    const old = changeAudit({
      id: 'x1',
      source: 'mongo',
      status: 'success',
      userId: '',
      docId: 'u1',
      contentType: 'core:organization.users',
      action: 'update',
      payload: {
        collectionName: 'users',
        updateDescription: {
          updated: {
            password: { prev: 'old-hash', current: 'new-hash' },
            updatedAt: { prev: 1, current: 2 },
          },
          added: { position: 'Sales' },
        },
      },
      createdAt: null,
    });

    expect(old.changes).toEqual({ password: '[redacted]', position: [null, 'Sales'] });
  });
});
