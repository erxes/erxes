// MongoDB 4.4.25 compatible
import {
  decodeMongo44Snapshot,
  encodeMongo44Snapshot,
  installMongo44WorkflowCompatibility,
} from '@/agents/mongo44Compatibility';

const snapshot = {
  status: 'suspended',
  context: { input: { schema: { $ref: '#/definitions/Answer' } } },
  requestContext: { subdomain: 'tenant-a', userId: 'user-a' },
};

const mockStorage = () => ({
  persistWorkflowSnapshot: jest.fn(),
  updateWorkflowResults: jest.fn(),
  updateWorkflowState: jest.fn(),
  loadWorkflowSnapshot: jest.fn(),
  listWorkflowRuns: jest.fn(),
  getWorkflowRunById: jest.fn(),
});

describe('MongoDB 4.4.25 compatible workflow snapshots', () => {
  it('round-trips nested schemas, dotted keys, arrays and envelope collisions', () => {
    const value = {
      ...snapshot,
      payload: [
        { '$schema': 'draft-07', 'a.b': { $ref: '#/x' }, '日本語': true },
        { __erxesMongo44Entries_v1: [['eA==', 1]] },
        JSON.parse('{"__proto__":{"$ref":"#/safe"}}'),
      ],
    };
    const before = JSON.stringify(value);
    const encoded = encodeMongo44Snapshot(value);
    expect(decodeMongo44Snapshot(encoded)).toEqual(value);
    expect(JSON.stringify(value)).toBe(before);
    expect(encoded).toMatchObject({ status: 'suspended', requestContext: snapshot.requestContext });
    const checkKeys = (entry: unknown): void => {
      if (!entry || typeof entry !== 'object') return;
      for (const [key, child] of Object.entries(entry)) {
        expect(key.startsWith('$') || key.includes('.')).toBe(false);
        checkKeys(child);
      }
    };
    checkKeys(encoded);
  });

  it('preserves BSON values and reads legacy unencoded snapshots unchanged', () => {
    const date = new Date();
    const buffer = Buffer.from('hello');
    const value = { date, buffer, schema: { $ref: '#/x', date, buffer } };
    expect(decodeMongo44Snapshot(encodeMongo44Snapshot(value))).toEqual(value);
    expect(decodeMongo44Snapshot(snapshot)).toEqual(snapshot);
    expect(decodeMongo44Snapshot(null)).toBeNull();
    expect(decodeMongo44Snapshot(undefined)).toBeUndefined();
  });

  it('wraps all three snapshot read paths without changing filters or pagination', async () => {
    const storage = mockStorage();
    storage.loadWorkflowSnapshot.mockResolvedValue(encodeMongo44Snapshot(snapshot));
    storage.getWorkflowRunById.mockResolvedValue({ snapshot: encodeMongo44Snapshot(snapshot) });
    storage.listWorkflowRuns.mockResolvedValue({ runs: [{ snapshot: encodeMongo44Snapshot(snapshot) }], total: 1 });
    installMongo44WorkflowCompatibility(storage);
    expect(await storage.loadWorkflowSnapshot({ workflowName: 'agents', runId: 'r1' })).toEqual(snapshot);
    expect(await storage.getWorkflowRunById({ runId: 'r1' })).toEqual({ snapshot });
    const filter = { status: 'suspended', resourceId: 'user-a', page: 0, perPage: 10 };
    expect(await storage.listWorkflowRuns(filter)).toEqual({ runs: [{ snapshot }], total: 1 });
    expect(storage.listWorkflowRuns).not.toBeUndefined();
  });

  it('encodes writes once, preserves method binding and propagates failures', async () => {
    const storage = mockStorage();
    const persist = storage.persistWorkflowSnapshot;
    const results = storage.updateWorkflowResults;
    const state = storage.updateWorkflowState;
    results.mockResolvedValue(encodeMongo44Snapshot(snapshot.context));
    state.mockResolvedValue(encodeMongo44Snapshot(snapshot));
    installMongo44WorkflowCompatibility(storage);
    installMongo44WorkflowCompatibility(storage);
    const args = { workflowName: 'agents', runId: 'r1', snapshot };
    await storage.persistWorkflowSnapshot(args);
    expect(persist).toHaveBeenCalledWith(encodeMongo44Snapshot(args));
    expect(persist.mock.instances[0]).toBe(storage);
    expect(await storage.updateWorkflowResults({ result: snapshot.context })).toEqual(snapshot.context);
    expect(results).toHaveBeenCalledWith(encodeMongo44Snapshot({ result: snapshot.context }));
    expect(await storage.updateWorkflowState({ opts: snapshot })).toEqual(snapshot);
    expect(state).toHaveBeenCalledWith(encodeMongo44Snapshot({ opts: snapshot }));
    persist.mockRejectedValueOnce(new Error('storage unavailable'));
    await expect(storage.persistWorkflowSnapshot(args)).rejects.toThrow('storage unavailable');
  });
});
