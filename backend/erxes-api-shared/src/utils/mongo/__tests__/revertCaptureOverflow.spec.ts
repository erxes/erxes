/**
 * OUTCOME-based test: a bulk delete/update whose match count exceeds the snapshot
 * cap must be FLAGGED (revertOverflow) so downstream (engine + UI) can tell the
 * user the change is only partially undoable — instead of silently truncating.
 */
// Tiny cap so a 3-row bulk overflows. Must be set BEFORE revertCapture is loaded
// (it reads the env at module-eval), so revertCapture is required lazily below.
process.env.REVERT_AUTO_JOURNAL_MAX = '2';

import mongoose, { Schema } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

const mockState: { enqueued: any[] } = { enqueued: [] };
jest.mock('../../mq-worker', () => ({
  sendWorkerQueue: () => ({
    add: (_name: string, payload: any) => {
      mockState.enqueued.push(payload);
      return Promise.resolve();
    },
  }),
}));
jest.mock('../../../core-modules/common/eventHandlers/runtimeContext', () => ({
  getEventHandlerRuntimeContext: () => ({
    subdomain: 'test',
    processId: 'pid',
    userId: 'u',
  }),
}));

describe('revertCapture: bulk capture beyond the cap is flagged revertOverflow', () => {
  let server: MongoMemoryServer;
  let Model: mongoose.Model<any>;

  beforeAll(async () => {
    // Required (not imported) so the env cap above is in effect at module-eval.
    const { installRevertCaptureHooks } = require('../revertCapture');
    server = await MongoMemoryServer.create();
    await mongoose.connect(server.getUri());
    const schema = new Schema({ n: Number, m: Number }, { timestamps: true });
    installRevertCaptureHooks(schema);
    Model = mongoose.model('OverflowSpine', schema);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await server.stop();
  });

  beforeEach(async () => {
    await Model.deleteMany({});
    mockState.enqueued.length = 0;
  });

  const find = (...actions: string[]) =>
    mockState.enqueued.find((e) => actions.includes(e.action));

  test('deleteMany OVER the cap -> revertOverflow + snapshot capped at the max', async () => {
    await Model.create([{ n: 1 }, { n: 1 }, { n: 1 }]); // 3 rows, cap is 2
    mockState.enqueued.length = 0;
    await Model.deleteMany({ n: 1 });

    const del = find('deleteMany');
    expect(del).toBeDefined();
    expect(del.revertOverflow).toBe(true);
    expect(del.payload.prevDocuments).toHaveLength(2); // not silently 3 / not 0
  });

  test('updateMany OVER the cap -> revertOverflow on the batch', async () => {
    await Model.create([{ n: 1 }, { n: 1 }, { n: 1 }]);
    mockState.enqueued.length = 0;
    await Model.updateMany({ n: 1 }, { $set: { m: 9 } });

    const batch = find('updateBatch', 'update');
    expect(batch).toBeDefined();
    expect(batch.revertOverflow).toBe(true);
  });

  test('a bulk WITHIN the cap is NOT flagged', async () => {
    await Model.create([{ n: 2 }, { n: 2 }]); // exactly the cap, no overflow
    mockState.enqueued.length = 0;
    await Model.deleteMany({ n: 2 });

    const del = find('deleteMany');
    expect(del).toBeDefined();
    expect(del.revertOverflow).toBeUndefined();
    expect(del.payload.prevDocuments).toHaveLength(2);
  });
});
