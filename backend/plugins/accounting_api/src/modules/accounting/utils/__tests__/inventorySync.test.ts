import { model, Schema } from 'mongoose';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { ITransaction, ITrDetail } from '../../@types/transaction';
import { TR_STATUSES } from '../../@types/constants';
import { removeSyncProductsInventory, syncProductsInventory } from '../utils';

jest.mock('erxes-api-shared/utils', () => ({
  sendTRPCMessage: jest.fn(),
  fixNum: (value: number, precision: number) =>
    Number(value.toFixed(precision)),
}));

const send = jest.mocked(sendTRPCMessage);
const detail = (values: Partial<ITrDetail> = {}): ITrDetail => ({
  accountId: 'inventory-account',
  productId: 'product',
  count: 5,
  amount: 100,
  ...values,
});
const transaction = (values: Partial<ITransaction> = {}): ITransaction => ({
  _id: 'income',
  date: new Date('2026-10-28'),
  journal: 'invIncome',
  status: TR_STATUSES.COMPLETE,
  branchId: 'branch',
  departmentId: 'department',
  details: [detail()],
  ...values,
});
const diff = (
  values: Partial<{
    diffCount: number;
    diffCost: number;
    diffSoonIn: number;
    diffSoonOut: number;
  }> = {},
) => ({
  productId: 'product',
  diffCount: 0,
  diffCost: 0,
  diffSoonIn: 0,
  diffSoonOut: 0,
  ...values,
});

beforeEach(() => {
  send.mockReset();
  send.mockResolvedValue(undefined);
});

describe('product inventory synchronization', () => {
  it('dispatches census income without waiting for Core', async () => {
    let finish: () => void = () => undefined;
    send.mockReturnValueOnce(
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
    );
    let completed = false;
    const pending = syncProductsInventory(
      'tenant',
      transaction({ contentType: 'safeRem' }),
    ).then(() => {
      completed = true;
    });
    await pending;
    expect(completed).toBe(true);
    expect(send).toHaveBeenCalledWith({
      subdomain: 'tenant',
      method: 'mutation',
      pluginName: 'core',
      module: 'products',
      action: 'increaseInventories',
      input: {
        branchId: 'branch',
        departmentId: 'department',
        productsInfo: [diff({ diffCount: 5, diffCost: 100 })],
      },
    });
    finish();
    await pending;
    expect(completed).toBe(true);
  });

  it('groups repeated products by detail location with header fallback', async () => {
    await syncProductsInventory(
      'tenant',
      transaction({
        details: [
          detail(),
          detail({ count: 2, amount: 40 }),
          detail({
            branchId: 'other-branch',
            departmentId: 'other-department',
            count: 3,
            amount: 60,
          }),
          detail({ branchId: 'other-branch', count: 1, amount: 20 }),
        ],
      }),
    );
    expect(send.mock.calls.map(([message]) => message.input)).toEqual([
      {
        branchId: 'branch',
        departmentId: 'department',
        productsInfo: [diff({ diffCount: 7, diffCost: 140 })],
      },
      {
        branchId: 'other-branch',
        departmentId: 'other-department',
        productsInfo: [diff({ diffCount: 3, diffCost: 60 })],
      },
      {
        branchId: 'other-branch',
        departmentId: 'department',
        productsInfo: [diff({ diffCount: 1, diffCost: 20 })],
      },
    ]);
  });

  it('reverses an edited detail at its old location and applies the new location', async () => {
    const old = transaction({ details: [detail({ branchId: 'old-branch' })] });
    await syncProductsInventory(
      'tenant',
      transaction({ details: [detail({ branchId: 'new-branch' })] }),
      old,
    );
    expect(send.mock.calls.map(([message]) => message.input)).toEqual([
      {
        branchId: 'new-branch',
        departmentId: 'department',
        productsInfo: [diff({ diffCount: 5, diffCost: 100 })],
      },
      {
        branchId: 'old-branch',
        departmentId: 'department',
        productsInfo: [diff({ diffCount: -5, diffCost: -100 })],
      },
    ]);
  });

  it('only sends changed quantities on edits and skips unchanged reposts', async () => {
    const old = transaction();
    await syncProductsInventory(
      'tenant',
      transaction({ details: [detail({ count: 7, amount: 140 })] }),
      old,
    );
    expect(send.mock.calls[0][0].input).toEqual({
      branchId: 'branch',
      departmentId: 'department',
      productsInfo: [diff({ diffCount: 2, diffCost: 40 })],
    });
    send.mockClear();
    await syncProductsInventory('tenant', old, old);
    expect(send).not.toHaveBeenCalled();
  });

  it('moves a draft incoming balance from soonIn to actual stock when completed', async () => {
    await syncProductsInventory(
      'tenant',
      transaction(),
      transaction({ status: TR_STATUSES.DRAFT }),
    );
    expect(send.mock.calls[0][0].input).toEqual({
      branchId: 'branch',
      departmentId: 'department',
      productsInfo: [diff({ diffCount: 5, diffCost: 100, diffSoonIn: -5 })],
    });
  });

  it('tracks outgoing stock and reverses pending outgoing stock without changing direction', async () => {
    await syncProductsInventory(
      'tenant',
      transaction({ journal: 'invOut' }),
      undefined,
      -1,
    );
    expect(send.mock.calls[0][0].input).toEqual({
      branchId: 'branch',
      departmentId: 'department',
      productsInfo: [diff({ diffCount: -5, diffCost: -100 })],
    });
    send.mockClear();
    await removeSyncProductsInventory(
      'tenant',
      transaction({ status: TR_STATUSES.DRAFT }),
      -1,
    );
    expect(send.mock.calls[0][0].input).toEqual({
      branchId: 'branch',
      departmentId: 'department',
      productsInfo: [diff({ diffSoonOut: -5 })],
    });
  });

  it('undoes income at its detail location, including an unspecified location', async () => {
    await removeSyncProductsInventory(
      'tenant',
      transaction({ branchId: undefined, departmentId: undefined }),
    );
    expect(send.mock.calls[0][0].input).toEqual({
      branchId: '_',
      departmentId: '_',
      productsInfo: [diff({ diffCount: -5, diffCost: -100 })],
    });
  });

  it('normalizes nullable Mongoose locations like reCalcRemainders before dispatch', async () => {
    const Movement = model<ITransaction>(
      'InventoryNullLocationRegression',
      new Schema<ITransaction>({
        _id: String,
        branchId: String,
        departmentId: String,
        status: String,
        details: [
          {
            accountId: String,
            productId: String,
            count: Number,
            amount: Number,
            branchId: String,
            departmentId: String,
          },
        ],
      }),
    );
    const movement = new Movement({
      ...transaction(),
      branchId: null,
      departmentId: null,
    });
    expect(movement.branchId).toBeNull();
    expect(movement.departmentId).toBeNull();
    await syncProductsInventory('tenant', movement);
    expect(send.mock.calls[0][0].input).toEqual({
      branchId: '_',
      departmentId: '_',
      productsInfo: [diff({ diffCount: 5, diffCost: 100 })],
    });
    send.mockClear();
    await removeSyncProductsInventory('tenant', movement);
    expect(send.mock.calls[0][0].input).toEqual({
      branchId: '_',
      departmentId: '_',
      productsInfo: [diff({ diffCount: -5, diffCost: -100 })],
    });
  });

  it('omits planned transactions and preserves cost-only adjustments', async () => {
    await syncProductsInventory(
      'tenant',
      transaction({ status: TR_STATUSES.PLAN }),
    );
    expect(send).not.toHaveBeenCalled();
    await syncProductsInventory(
      'tenant',
      transaction({ details: [detail({ count: 0, amount: 30 })] }),
    );
    expect(send.mock.calls[0][0].input).toEqual({
      branchId: 'branch',
      departmentId: 'department',
      productsInfo: [diff({ diffCost: 30 })],
    });
  });
});
