/// <reference types="jest" />

import { graphqlPubsub } from 'erxes-api-shared/utils';
import subscription from '~/apollo/subscription';
import { IModels } from '~/connectionResolvers';
import { ADJ_INV_STATUSES } from '../../@types/adjustInventory';
import { modifierWrapper } from '../inventories';

jest.mock('erxes-api-shared/utils', () => ({
  graphqlPubsub: { publish: jest.fn(() => Promise.resolve()) },
  sendTRPCMessage: jest.fn(),
}));

const ADJUST_SUBSCRIPTIONS = [
  'accountingAdjustInventoryChanged',
  'accountingAdjustFixedAssetChanged',
  'accountingAdjustFundRateChanged',
  'accountingAdjustDebtRateChanged',
] as const;

const subscribeAs = (
  name: (typeof ADJUST_SUBSCRIPTIONS)[number],
  subdomain: string,
  adjustId: string,
) => {
  const asyncIterator = jest.fn((channel: string) => channel);
  const resolvers = subscription.generateResolvers({ asyncIterator });

  return resolvers[name].subscribe(undefined, { adjustId }, { subdomain });
};

describe('adjustment subscriptions', () => {
  it.each(ADJUST_SUBSCRIPTIONS)(
    '%s listens only to the signed-in tenant adjustment',
    (name) => {
      expect(subscribeAs(name, 'khan-bank', 'adj-2026-10')).toBe(
        `${name}:khan-bank:adj-2026-10`,
      );
    },
  );

  it.each(ADJUST_SUBSCRIPTIONS)(
    '%s keeps two tenants apart even when adjustment ids collide',
    (name) => {
      expect(subscribeAs(name, 'khan-bank', 'adj-2026-10')).not.toBe(
        subscribeAs(name, 'golomt', 'adj-2026-10'),
      );
    },
  );
});

describe('modifierWrapper', () => {
  const draftAdjust = {
    _id: 'adj-2026-10',
    date: new Date('2026-10-31T00:00:00.000Z'),
    status: ADJ_INV_STATUSES.DRAFT,
    error: 'Old failure from last run',
  };

  beforeEach(() => {
    jest.mocked(graphqlPubsub.publish).mockClear();
  });

  it('publishes the saved adjustment, not the stale object the run started with', async () => {
    const saved = {
      ...draftAdjust,
      status: ADJ_INV_STATUSES.RUNNING,
      error: '',
      successDate: new Date('2026-10-15T00:00:00.000Z'),
    };
    const models = {
      AdjustInventories: {
        updateAdjustInventory: jest.fn().mockResolvedValue(saved),
      },
    } as unknown as IModels;

    const result = await modifierWrapper(
      'khan-bank',
      models,
      draftAdjust as never,
      { successDate: saved.successDate },
    );

    expect(graphqlPubsub.publish).toHaveBeenCalledWith(
      'accountingAdjustInventoryChanged:khan-bank:adj-2026-10',
      { accountingAdjustInventoryChanged: saved },
    );
    expect(result).toBe(saved);
  });

  it('publishes nothing when the adjustment was removed before the update', async () => {
    const models = {
      AdjustInventories: {
        updateAdjustInventory: jest
          .fn()
          .mockRejectedValue(new Error('Adjusting not found')),
      },
    } as unknown as IModels;

    await expect(
      modifierWrapper('khan-bank', models, draftAdjust as never, {
        status: ADJ_INV_STATUSES.COMPLETE,
      }),
    ).rejects.toThrow('Adjusting not found');
    expect(graphqlPubsub.publish).not.toHaveBeenCalled();
  });
});
