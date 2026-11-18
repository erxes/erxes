const sendTRPCMessage = jest.fn();

jest.mock('erxes-api-shared/utils', () => ({
  ...jest.requireActual('erxes-api-shared/utils/utils'),
  sendTRPCMessage: (...args: unknown[]) => sendTRPCMessage(...args),
}));

import { bookMovement, buildMoveTransaction, MOVEMENT_CONTENT_TYPE } from '../accountingService';

const sealed = { accountId: 'acc-inv', branchId: 'br-1', departmentId: 'dep-sealed' };
const open = { accountId: 'acc-inv', branchId: 'br-1', departmentId: 'dep-open' };

const movement = {
  _id: 'mv-1',
  requestKey: 'key-1',
  type: 'BREAK_BOX' as const,
  number: 'RFID-1',
  date: new Date('2026-11-18T00:00:00Z'),
  zoneId: 'zone-1',
  source: sealed,
  destination: open,
  items: [
    { productId: 'p-1', quantity: 24, epcIds: ['A', 'B'] },
    { productId: 'p-2', quantity: 0, epcIds: [] },
  ],
  accountingStatus: 'pending' as const,
};

const fakeModels = () => {
  const setAccountingResult = jest.fn();
  return {
    setAccountingResult,
    models: {
      Movements: {
        setAccountingResult,
        findOne: () => ({ lean: async () => movement }),
      },
    } as never,
  };
};

const routeAccounting = (responses: Record<string, unknown>) =>
  sendTRPCMessage.mockImplementation(async ({ action }) => responses[action]);

beforeEach(() => sendTRPCMessage.mockReset());

describe('buildMoveTransaction', () => {
  it('books an inventory move from the sealed to the open location at current cost', () => {
    const tr = buildMoveTransaction(movement, { 'p-1': { unitCost: 1500 } });

    expect(tr).toMatchObject({
      journal: 'invMove',
      side: 'ct',
      status: 'complete',
      branchId: 'br-1',
      departmentId: 'dep-sealed',
      contentType: MOVEMENT_CONTENT_TYPE,
      contentId: 'mv-1',
      followInfos: { moveInAccountId: 'acc-inv', moveInBranchId: 'br-1', moveInDepartmentId: 'dep-open' },
    });
    expect(tr.parentId).toBe(tr._id);
    expect(tr.details).toHaveLength(1);
    expect(tr.details[0]).toMatchObject({ productId: 'p-1', count: 24, unitPrice: 1500, amount: 36000 });
  });

  it('keeps the ids and date of the earlier transaction when re-sending', () => {
    const old = { _id: 'tr-1', ptrId: 'ptr-1', parentId: 'tr-1', date: new Date('2026-11-01T00:00:00Z') };
    const tr = buildMoveTransaction(movement, {}, old);

    expect(tr).toMatchObject({ _id: 'tr-1', ptrId: 'ptr-1', parentId: 'tr-1', date: old.date });
    expect(tr.details[0].unitPrice).toBe(0);
  });
});

describe('bookMovement', () => {
  it('creates the transaction and stores success', async () => {
    const { models, setAccountingResult } = fakeModels();
    routeAccounting({
      getTransactions: [],
      activeCost: { 'p-1': { unitCost: 10 } },
      savePTransaction: { parentId: 'tr-new' },
    });

    await bookMovement(models, 'sub', movement, 'user-1');

    const save = sendTRPCMessage.mock.calls.find(([a]) => a.action === 'savePTransaction')[0];
    expect(save).toMatchObject({ pluginName: 'accounting', method: 'mutation', throwOnError: true });
    expect(save.input.parentId).toBeUndefined();
    expect(save.input.userId).toBe('user-1');
    expect(setAccountingResult).toHaveBeenCalledWith('mv-1', { status: 'success', message: 'success', trId: 'tr-new' });
  });

  it('replaces the earlier transaction and excludes it from the cost', async () => {
    const { models } = fakeModels();
    routeAccounting({
      getTransactions: [{ _id: 'tr-1', ptrId: 'ptr-1', parentId: 'tr-1' }],
      activeCost: {},
      savePTransaction: { parentId: 'tr-1' },
    });

    await bookMovement(models, 'sub', movement);

    const cost = sendTRPCMessage.mock.calls.find(([a]) => a.action === 'activeCost')[0];
    expect(cost.input.excludedTransactionIds).toEqual(['tr-1']);
    const save = sendTRPCMessage.mock.calls.find(([a]) => a.action === 'savePTransaction')[0];
    expect(save.input.parentId).toBe('tr-1');
  });

  it('stores the error when accounting fails', async () => {
    const { models, setAccountingResult } = fakeModels();
    sendTRPCMessage.mockRejectedValue(new Error('Not found move in Account'));

    await bookMovement(models, 'sub', movement);

    expect(setAccountingResult).toHaveBeenCalledWith('mv-1', { status: 'error', message: 'Not found move in Account' });
  });

  it('stores an error when accounting gives no answer', async () => {
    const { models, setAccountingResult } = fakeModels();
    routeAccounting({ getTransactions: [], activeCost: {} });

    await bookMovement(models, 'sub', movement);

    expect(setAccountingResult).toHaveBeenCalledWith('mv-1', expect.objectContaining({ status: 'error' }));
  });
});
