import { IModels } from '~/connectionResolvers';
import { findLoyaltyObject } from '../findObject';
import { getOwnerSummary } from '~/utils/ownerSummary';

jest.mock('~/utils/ownerSummary', () => ({ getOwnerSummary: jest.fn() }));

const account = {
  _id: 'a1',
  number: 'L-0001',
  status: 'active',
  ownerType: 'customer',
  ownerId: 'c-102',
};

const modelsWith = (doc: unknown) => {
  const lean = jest.fn().mockResolvedValue(doc);
  const findOne = jest.fn().mockReturnValue({ lean });

  return {
    findOne,
    models: { LoyaltyAccounts: { findOne } } as unknown as IModels,
  };
};

describe('findLoyaltyObject', () => {
  beforeEach(() => {
    (getOwnerSummary as jest.Mock).mockResolvedValue({
      wallets: [
        {
          accountTypeId: 't1',
          name: 'Points',
          balance: 1200,
          pending: 0,
          tier: { key: 'gold', name: 'Gold' },
          expiringSoon: 100,
        },
      ],
      vouchers: [
        {
          _id: 'v1',
          campaignId: 'k1',
          title: '10% off',
          voucherType: 'discount',
          kind: 'percent',
          value: 10,
          status: 'new',
          autoApplied: false,
          applicable: true,
        },
      ],
    });
  });

  it("reads a customer's account only, never a company's", async () => {
    const { models, findOne } = modelsWith(account);

    await findLoyaltyObject(models, 'tenant', {
      objectType: 'loyalty:score.accounts',
      field: 'ownerId',
      value: 'c-102',
    });

    expect(findOne).toHaveBeenCalledWith({
      ownerType: 'customer',
      ownerId: 'c-102',
    });
  });

  it('answers with wallets and vouchers a person can read', async () => {
    const { models } = modelsWith(account);

    const result = await findLoyaltyObject(models, 'tenant', {
      objectType: 'loyalty:score.accounts',
      field: 'number',
      value: 'L-0001',
    });

    expect(result.object).toEqual({
      _id: 'a1',
      number: 'L-0001',
      status: 'active',
      ownerId: 'c-102',
      wallets: [
        {
          name: 'Points',
          balance: 1200,
          pending: 0,
          tier: 'Gold',
          expiringSoon: 100,
        },
      ],
      vouchers: [
        {
          title: '10% off',
          kind: 'percent',
          value: 10,
          expiresAt: undefined,
          status: 'new',
        },
      ],
    });
  });

  it('is not found without an account', async () => {
    const { models } = modelsWith(null);

    const result = await findLoyaltyObject(models, 'tenant', {
      objectType: 'loyalty:score.accounts',
      field: 'ownerId',
      value: 'c-404',
    });

    expect(result).toMatchObject({ found: false, object: null });
    expect(getOwnerSummary).not.toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({ ownerId: 'c-404' }),
    );
  });
});
