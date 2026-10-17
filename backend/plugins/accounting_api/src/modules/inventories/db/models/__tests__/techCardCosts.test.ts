import type { IModels } from '~/connectionResolvers';
import type { ITechCard } from '../../../@types/techCards';
import { ITechCardModel, loadTechCardClass } from '../TechCards';

const baseCard: ITechCard = {
  name: 'Production step',
  durationType: 'real',
  inputs: [{ productId: 'input', quantity: 1 }],
  outputs: [{ productId: 'output', quantity: 1, costRatio: 1 }],
};

const setup = () => {
  const create = jest.fn().mockResolvedValue({ _id: 'card' });
  const updateOne = jest.fn().mockResolvedValue({ modifiedCount: 1 });
  const getTechCard = jest.fn().mockResolvedValue({ _id: 'card' });
  const getAccount = jest.fn().mockResolvedValue({ status: 'active' });
  const models = {
    TechCards: { create, updateOne, getTechCard },
    Accounts: { getAccount },
  } as unknown as IModels;
  const statics = loadTechCardClass(models).statics as Pick<
    ITechCardModel,
    'createTechCard' | 'updateTechCard'
  >;
  return { statics, create, updateOne, getAccount, getTechCard };
};

test('omitted cost groups default to empty arrays without account lookups', async () => {
  const { statics, create, getAccount } = setup();
  await statics.createTechCard(baseCard, 'user');
  expect(create).toHaveBeenCalledWith(
    expect.objectContaining({
      laborCosts: [],
      overheadCosts: [],
    }),
  );
  expect(getAccount).not.toHaveBeenCalled();
});

test.each(['overheadCosts', 'laborCosts'] as const)(
  '%s requires an account for every row',
  async (field) => {
    const { statics, create } = setup();
    await expect(
      statics.createTechCard(
        {
          ...baseCard,
          [field]: [{ name: 'Cost', amount: 100, accountId: '' }],
        },
        'user',
      ),
    ).rejects.toThrow('posting account is required');
    expect(create).not.toHaveBeenCalled();
  },
);

test.each([-1, Number.NaN, Number.POSITIVE_INFINITY])(
  'rejects invalid cost %p before writing',
  async (amount) => {
    const { statics, create } = setup();
    await expect(
      statics.createTechCard(
        {
          ...baseCard,
          overheadCosts: [{ name: 'Cost', amount, accountId: 'overhead' }],
        },
        'user',
      ),
    ).rejects.toThrow('finite non-negative amount');
    expect(create).not.toHaveBeenCalled();
  },
);

test('persists both estimates and checks tenant-scoped active posting accounts on edit', async () => {
  const { statics, updateOne, getAccount } = setup();
  const costs = {
    overheadCosts: [
      { name: 'Electricity', amount: 1500, accountId: 'overhead' },
    ],
    laborCosts: [
      { name: 'Assembly', amount: 2500, accountId: 'labor' },
      { name: 'Packing', amount: 500, accountId: 'labor' },
    ],
  };
  await statics.updateTechCard({ ...baseCard, _id: 'card', ...costs }, 'user');
  expect(getAccount).toHaveBeenCalledWith({
    _id: 'overhead',
    status: 'active',
  });
  expect(getAccount).toHaveBeenCalledWith({ _id: 'labor', status: 'active' });
  expect(getAccount).toHaveBeenCalledTimes(2);
  expect(updateOne).toHaveBeenCalledWith(
    { _id: 'card' },
    expect.objectContaining({ $set: expect.objectContaining(costs) }),
  );
});

test('a missing or inactive account prevents persistence', async () => {
  const { statics, create, getAccount } = setup();
  getAccount.mockRejectedValue(new Error('Account not found'));
  await expect(
    statics.createTechCard(
      {
        ...baseCard,
        laborCosts: [{ name: 'Labor', amount: 500, accountId: 'missing' }],
      },
      'user',
    ),
  ).rejects.toThrow('Account not found');
  expect(create).not.toHaveBeenCalled();
});

test('cost rows require a name', async () => {
  const { statics, create } = setup();
  await expect(
    statics.createTechCard(
      {
        ...baseCard,
        laborCosts: [{ name: ' ', amount: 100, accountId: 'labor' }],
      },
      'user',
    ),
  ).rejects.toThrow('name is required');
  expect(create).not.toHaveBeenCalled();
});

test('editing to empty arrays clears all cost rows', async () => {
  const { statics, getTechCard, updateOne, getAccount } = setup();
  getTechCard.mockResolvedValue({
    ...baseCard,
    _id: 'card',
    laborCosts: [{ name: 'Assembly', amount: 500, accountId: 'labor' }],
    overheadCosts: [
      { name: 'Electricity', amount: 300, accountId: 'overhead' },
    ],
  });
  await statics.updateTechCard(
    { ...baseCard, _id: 'card', laborCosts: [], overheadCosts: [] },
    'user',
  );
  expect(updateOne).toHaveBeenCalledWith(
    { _id: 'card' },
    expect.objectContaining({
      $set: expect.objectContaining({ laborCosts: [], overheadCosts: [] }),
    }),
  );
  expect(getAccount).not.toHaveBeenCalled();
});

test('editing without cost groups preserves existing array rows', async () => {
  const { statics, getTechCard, updateOne } = setup();
  getTechCard.mockResolvedValue({
    ...baseCard,
    _id: 'card',
    laborCosts: [{ name: 'Assembly', amount: 500, accountId: 'labor' }],
  });
  await statics.updateTechCard({ ...baseCard, _id: 'card' }, 'user');
  expect(updateOne).toHaveBeenCalledWith(
    { _id: 'card' },
    expect.objectContaining({
      $set: expect.objectContaining({
        laborCosts: [{ name: 'Assembly', amount: 500, accountId: 'labor' }],
      }),
    }),
  );
});
