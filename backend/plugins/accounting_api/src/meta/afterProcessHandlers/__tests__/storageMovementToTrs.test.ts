/// <reference types="jest" />

import { IModels } from '~/connectionResolvers';
import { ITransaction } from '~/modules/accounting/@types/transaction';
import { activeCost } from '~/modules/accounting/utils/inventories';
import {
  STORAGE_MOVEMENT_CONTENT_TYPE,
  storageMovementToTrs,
} from '../storageMovementToTrs';

jest.mock('erxes-api-shared/utils', () => ({
  fixNum: (value: number) => value,
}));
jest.mock('~/modules/accounting/utils/inventories', () => ({
  activeCost: jest.fn(),
}));

describe('storageMovementToTrs', () => {
  const lean = jest.fn();
  const find = jest.fn(() => ({ lean }));
  const createPTransaction = jest.fn<
    Promise<ITransaction[]>,
    [ITransaction[], string, object]
  >();
  const updatePTransaction = jest.fn<
    Promise<ITransaction[]>,
    [string, ITransaction[], string, object]
  >();
  const models = {
    Transactions: { find, createPTransaction, updatePTransaction },
  } as unknown as IModels;

  const source = { accountId: 'acc-sealed', branchId: 'b1', departmentId: 'd-sealed' };
  const destination = { accountId: 'acc-open', branchId: 'b1', departmentId: 'd-open' };
  const movement = {
    _id: 'movement-1',
    number: 'RFID-1',
    date: '2026-11-17T00:00:00.000Z',
    source,
    destination,
    items: [
      { productId: 'p1', quantity: 12 },
      { productId: 'p2', quantity: 6 },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    lean.mockResolvedValue([]);
    (activeCost as jest.Mock).mockResolvedValue({
      p1: { unitCost: 100, totalCost: 0, remainder: 0 },
    });
  });

  it('creates one inventory move from the sealed to the open location', async () => {
    await storageMovementToTrs({ models, userId: 'user', movement });

    expect(find).toHaveBeenCalledWith({
      contentType: STORAGE_MOVEMENT_CONTENT_TYPE,
      contentId: 'movement-1',
      journal: 'invMove',
    });
    expect(activeCost).toHaveBeenCalledWith(
      models,
      'acc-sealed',
      'b1',
      'd-sealed',
      ['p1', 'p2'],
      [],
    );
    expect(updatePTransaction).not.toHaveBeenCalled();

    const [[trDoc], userId, options] = createPTransaction.mock.calls[0];
    expect(userId).toBe('user');
    expect(options).toEqual({ skipAccountPermission: true });
    expect(trDoc).toMatchObject({
      journal: 'invMove',
      number: 'RFID-1',
      branchId: 'b1',
      departmentId: 'd-sealed',
      contentType: STORAGE_MOVEMENT_CONTENT_TYPE,
      contentId: 'movement-1',
      followInfos: {
        moveInAccountId: 'acc-open',
        moveInBranchId: 'b1',
        moveInDepartmentId: 'd-open',
      },
    });
    expect(trDoc.details).toHaveLength(2);
    expect(trDoc.details[0]).toMatchObject({
      accountId: 'acc-sealed',
      productId: 'p1',
      count: 12,
      unitPrice: 100,
      amount: 1200,
    });
    // No cost known for p2 yet: booked at zero rather than failing the move.
    expect(trDoc.details[1]).toMatchObject({ productId: 'p2', count: 6, amount: 0 });
  });

  it('updates the existing transaction when the movement is sent again', async () => {
    lean.mockResolvedValue([
      { _id: 'tr-1', ptrId: 'ptr-1', parentId: 'parent-1', date: new Date('2026-11-01') },
    ]);

    await storageMovementToTrs({ models, userId: 'user', movement });

    expect(createPTransaction).not.toHaveBeenCalled();
    const [parentId, [trDoc]] = updatePTransaction.mock.calls[0];
    expect(parentId).toBe('parent-1');
    expect(trDoc).toMatchObject({ _id: 'tr-1', ptrId: 'ptr-1', date: new Date('2026-11-01') });
    expect((activeCost as jest.Mock).mock.calls[0][5]).toEqual(['tr-1']);
  });

  it.each([
    [{ ...movement, items: [] }, 'no products with positive quantity'],
    [{ ...movement, items: [{ productId: 'p1', quantity: 0 }] }, 'no products with positive quantity'],
    [{ ...movement, source: { branchId: 'b1', departmentId: 'd' } }, 'source needs an account'],
    [{ ...movement, destination: undefined }, 'destination needs an account'],
  ])('rejects an incomplete movement (%#)', async (bad, message) => {
    await expect(
      storageMovementToTrs({ models, userId: 'user', movement: bad }),
    ).rejects.toThrow(message);
    expect(createPTransaction).not.toHaveBeenCalled();
  });
});
