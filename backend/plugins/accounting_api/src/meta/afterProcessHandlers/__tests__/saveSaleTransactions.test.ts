import { graphqlPubsub } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import {
  ITransaction,
  ITransactionDocument,
} from '@/accounting/@types/transaction';
import { setPtrStatus } from '@/accounting/db/models/utils';
import InvSaleOutCostTrs from '@/accounting/utils/invSale';
import {
  createOrUpdateTr,
  syncProductsInventory,
} from '@/accounting/utils/utils';
import { prepareRealJobProduction } from '../realJobProduction';
import { saveSaleTransactions } from '../saveSaleTransactions';

jest.mock('erxes-api-shared/utils', () => ({
  graphqlPubsub: { publish: jest.fn().mockResolvedValue(undefined) },
}));
jest.mock('@/accounting/db/models/utils', () => ({ setPtrStatus: jest.fn() }));
jest.mock('@/accounting/utils/invSale');
jest.mock('@/accounting/utils/utils', () => ({
  createOrUpdateTr: jest.fn(),
  syncProductsInventory: jest.fn(),
}));
jest.mock('../realJobProduction', () => ({
  prepareRealJobProduction: jest.fn(),
}));

const sale: ITransaction = {
  _id: 'requested-sale',
  date: new Date('2026-10-22'),
  journal: 'invSale',
  branchId: 'branch',
  departmentId: 'department',
  contentType: 'sales:deal',
  contentId: 'deal',
  followInfos: { saleOutAccountId: 'inventory' },
  details: [
    {
      _id: 'sale-detail',
      accountId: 'revenue',
      productId: 'product',
      count: 5,
      amount: 100,
    },
  ],
};
const root = (doc: ITransaction, id: string): ITransactionDocument =>
  ({
    ...doc,
    _id: id,
    parentId: 'actual-parent',
    ptrId: 'actual-pointer',
  } as ITransactionDocument);
const production = (journal: string): ITransaction => ({
  ...sale,
  _id: undefined,
  journal,
  side: journal === 'invOut' ? 'ct' : 'dt',
  extraData: { jobProductionKey: journal },
  details: [
    {
      _id: `${journal}-detail`,
      accountId: 'inventory',
      productId: journal === 'invOut' ? 'material' : 'product',
      count: 3,
      amount: 27,
    },
  ],
});

const setup = (
  previous: ITransactionDocument[] = [],
  docs = [production('invOut'), production('invIncome')],
) => {
  const events: string[] = [];
  const savedSale = root(sale, 'actual-sale');
  const saveGroup = jest.fn().mockImplementation(async () => {
    events.push('group');
    return [savedSale];
  });
  const find = jest
    .fn()
    .mockReturnValue({ lean: jest.fn().mockResolvedValue(previous) });
  const models = {
    Transactions: {
      find,
      getTransaction: jest
        .fn()
        .mockResolvedValue({ ...savedSale, ptrNumber: 'saved-number' }),
      createPTransaction: saveGroup,
      updatePTransaction: saveGroup,
    },
  } as unknown as IModels;
  jest
    .mocked(prepareRealJobProduction)
    .mockResolvedValue({ details: [], docs });
  jest
    .mocked(createOrUpdateTr)
    .mockImplementation(async (_models, _user, doc) => {
      events.push(doc.journal);
      return root(doc, doc._id || doc.journal);
    });
  jest
    .mocked(InvSaleOutCostTrs.prototype.doTrs)
    .mockImplementation(async () => {
      events.push('sale-cost');
      return [];
    });
  return { models, events, saveGroup, savedSale };
};

describe('after-process production root journals', () => {
  beforeEach(() => jest.clearAllMocks());

  it('adds editable root tabs to the actual saved group before refreshing sale cost', async () => {
    const { models, events, saveGroup, savedSale } = setup();
    await saveSaleTransactions({
      subdomain: 'tenant',
      models,
      userId: 'user',
      docs: [sale],
      allowRealJobProduction: true,
    });
    expect(saveGroup).toHaveBeenCalledWith([sale], 'user', {
      skipAccountPermission: true,
    });
    expect(events).toEqual(['group', 'invOut', 'invIncome', 'sale-cost']);
    const writes = jest.mocked(createOrUpdateTr).mock.calls;
    expect(writes).toHaveLength(2);
    for (const [, , doc] of writes) {
      expect(doc).toMatchObject({
        parentId: 'actual-parent',
        ptrId: 'actual-pointer',
        ptrNumber: 'saved-number',
        contentType: 'sales:deal',
      });
      expect(doc.originId).toBeUndefined();
      expect(doc.originType).toBeUndefined();
    }
    expect(syncProductsInventory).toHaveBeenCalledWith(
      'tenant',
      expect.objectContaining({ journal: 'invOut' }),
      undefined,
      -1,
    );
    expect(syncProductsInventory).toHaveBeenCalledWith(
      'tenant',
      expect.objectContaining({ journal: 'invIncome' }),
      undefined,
      1,
    );
    expect(InvSaleOutCostTrs.prototype.doTrs).toHaveBeenCalledWith(
      expect.objectContaining(savedSale),
    );
    expect(setPtrStatus).toHaveBeenCalled();
    expect(graphqlPubsub.publish).toHaveBeenCalledTimes(2);
  });

  it('replaces owned production on resync, excluding the full old group and retaining identities', async () => {
    const oldIncome = root(production('invIncome'), 'old-income');
    oldIncome.details = [{ ...oldIncome.details[0], _id: 'old-detail' }];
    const previous = [
      root(sale, 'old-sale'),
      oldIncome,
      root({ ...sale, originId: 'old-sale' }, 'old-sale-out'),
    ];
    const { models, saveGroup } = setup(previous);
    await saveSaleTransactions({
      subdomain: 'tenant',
      models,
      userId: 'user',
      docs: [sale],
      parentId: 'actual-parent',
      allowRealJobProduction: true,
    });
    expect(prepareRealJobProduction).toHaveBeenCalledWith(
      'tenant',
      models,
      'user',
      expect.objectContaining({
        details: [expect.objectContaining({ accountId: 'inventory' })],
      }),
      ['old-sale', 'old-income', 'old-sale-out'],
    );
    expect(saveGroup).toHaveBeenCalledWith('actual-parent', [sale], 'user', {
      skipAccountPermission: true,
    });
    expect(createOrUpdateTr).toHaveBeenCalledWith(
      models,
      'user',
      expect.objectContaining({
        _id: 'old-income',
        details: [expect.objectContaining({ _id: 'old-detail' })],
      }),
    );
  });

  it('removes obsolete production through the normal group lifecycle and refreshes cost', async () => {
    const { models, events, saveGroup } = setup(
      [root(production('invIncome'), 'old-income')],
      [],
    );
    await saveSaleTransactions({
      subdomain: 'tenant',
      models,
      userId: 'user',
      docs: [sale],
      parentId: 'actual-parent',
      allowRealJobProduction: true,
    });
    expect(saveGroup).toHaveBeenCalledWith('actual-parent', [sale], 'user', {
      skipAccountPermission: true,
    });
    expect(createOrUpdateTr).not.toHaveBeenCalled();
    expect(events).toEqual(['group', 'sale-cost']);
  });

  it('does not plan production for direct sync callers and retains their existing tabs', async () => {
    const previous = [root(production('invIncome'), 'old-income')];
    const { models, saveGroup } = setup(previous);
    await saveSaleTransactions({
      subdomain: 'tenant',
      models,
      userId: 'user',
      docs: [sale],
      parentId: 'actual-parent',
    });
    expect(prepareRealJobProduction).not.toHaveBeenCalled();
    expect(saveGroup).toHaveBeenCalledWith(
      'actual-parent',
      [sale, ...previous],
      'user',
      { skipAccountPermission: true },
    );
    expect(createOrUpdateTr).not.toHaveBeenCalled();
  });

  it('fails production validation before changing the sale group', async () => {
    const { models, saveGroup } = setup();
    jest
      .mocked(prepareRealJobProduction)
      .mockRejectedValueOnce(new Error('Denied'));
    await expect(
      saveSaleTransactions({
        subdomain: 'tenant',
        models,
        userId: 'user',
        docs: [sale],
        allowRealJobProduction: true,
      }),
    ).rejects.toThrow('Denied');
    expect(saveGroup).not.toHaveBeenCalled();
  });

  it('avoids a second cost write when neither new nor previous production exists', async () => {
    const { models } = setup([], []);
    await saveSaleTransactions({
      subdomain: 'tenant',
      models,
      userId: 'user',
      docs: [sale],
      allowRealJobProduction: true,
    });
    expect(InvSaleOutCostTrs).not.toHaveBeenCalled();
    expect(graphqlPubsub.publish).not.toHaveBeenCalled();
  });
});
