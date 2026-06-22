/**
 * OUTCOME-based tests for the capture spine: the REAL revert-capture hooks,
 * installed on a REAL ephemeral MongoDB, must journal what ACTUALLY happened so a
 * later revert can undo it. The queue transport is intercepted in-process (no
 * Redis); everything else is the real code. Assertions compare the journal to the
 * real before/after documents — not to the implementation.
 */
import mongoose, { Schema } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { getDiffObjects } from '../../utils';

// Intercept what the hooks enqueue (and let a test simulate a down queue).
const mockState: { enqueued: any[]; throwOnAdd: boolean } = {
  enqueued: [],
  throwOnAdd: false,
};
jest.mock('../../mq-worker', () => ({
  sendWorkerQueue: () => ({
    add: (_name: string, payload: any) => {
      if (mockState.throwOnAdd) throw new Error('queue unavailable');
      mockState.enqueued.push(payload);
      return Promise.resolve();
    },
  }),
}));
jest.mock(
  '../../../core-modules/common/eventHandlers/runtimeContext',
  () => ({
    getEventHandlerRuntimeContext: () => ({
      subdomain: 'test',
      processId: 'pid-1',
      userId: 'actor-1',
    }),
  }),
);

// Imported AFTER the mocks so the hooks bind to the intercepted modules.
import { installRevertCaptureHooks } from '../revertCapture';

describe('revertCapture: hooks journal the real change (capture spine)', () => {
  let server: MongoMemoryServer;
  let Model: mongoose.Model<any>;

  beforeAll(async () => {
    server = await MongoMemoryServer.create();
    await mongoose.connect(server.getUri());
    const schema = new Schema(
      { name: String, score: Number, email: String },
      { timestamps: true },
    );
    installRevertCaptureHooks(schema);
    Model = mongoose.model('CaptureSpine', schema);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await server.stop();
  });

  beforeEach(async () => {
    await Model.deleteMany({});
    mockState.enqueued.length = 0;
    mockState.throwOnAdd = false;
  });

  const journaled = (action: string) =>
    mockState.enqueued.filter((e) => e.action === action);

  test('DELETE journals the prior document so it can be re-inserted', async () => {
    const doc = await Model.create({ name: 'Acme', score: 10 });
    mockState.enqueued.length = 0;
    await Model.deleteOne({ _id: doc._id });

    const del = journaled('delete');
    expect(del).toHaveLength(1);
    expect(del[0].payload.prevDocument._id.toString()).toBe(doc._id.toString());
    expect(del[0].payload.prevDocument.name).toBe('Acme');
    expect(del[0].processId).toBe('pid-1'); // correlated to the request
  });

  test('EDIT journals the exact before->after diff that occurred', async () => {
    const doc = await Model.create({ name: 'Old', score: 1 });
    const before = await Model.findById(doc._id).lean();
    mockState.enqueued.length = 0;

    await Model.updateOne({ _id: doc._id }, { $set: { name: 'New', score: 2 } });
    const after = await Model.findById(doc._id).lean();

    const upd = journaled('update');
    expect(upd).toHaveLength(1);
    // The journaled updateDescription must equal the diff between the document
    // that existed and the document Mongo produced — a faithful record of reality.
    const real: any = getDiffObjects(before as any, after as any);
    const recorded: any = upd[0].payload.updateDescription;
    expect(JSON.stringify(recorded.updated?.name)).toBe(
      JSON.stringify(real.updated?.name),
    );
    expect(JSON.stringify(recorded.updated?.score)).toBe(
      JSON.stringify(real.updated?.score),
    );
  });

  test('updateMany over N docs journals ONE batch message, one entry per doc', async () => {
    await Model.create([
      { name: 'a', score: 1 },
      { name: 'b', score: 1 },
      { name: 'c', score: 1 },
    ]);
    mockState.enqueued.length = 0;

    await Model.updateMany({ score: 1 }, { $set: { score: 2 } });

    const batch = journaled('updateBatch');
    expect(batch).toHaveLength(1); // ONE message, not N
    expect(batch[0].payload.updates).toHaveLength(3); // one entry per matched doc
    expect(batch[0].docIds).toHaveLength(3);
  });

  test('a failing journal queue NEVER breaks or blocks the host write', async () => {
    const doc = await Model.create({ name: 'KeepMe', score: 5 });
    mockState.throwOnAdd = true; // the journal transport is down

    await expect(
      Model.updateOne({ _id: doc._id }, { $set: { score: 9 } }),
    ).resolves.toBeDefined();

    const after = await Model.findById(doc._id).lean();
    expect((after as any).score).toBe(9); // the write still applied
  });

  test('creating a document is NOT journaled (revert of a new record = delete it)', async () => {
    mockState.enqueued.length = 0;
    await Model.create({ name: 'Fresh', score: 0 });
    expect(mockState.enqueued).toHaveLength(0);
  });
});
