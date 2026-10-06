import type { IContext } from '~/connectionResolvers';
import {
  integrationMutations,
  sendUpdateIntegration,
} from '@/inbox/graphql/resolvers/mutations/integrations';
import { facebookUpdateIntegrations } from '@/integrations/facebook/messageBroker';
import { instagramUpdateIntegrations } from '@/integrations/instagram/messageBroker';
import { mailUpdateIntegration } from '@/integrations/mail/messageBroker';
import { callUpdateIntegration } from '@/integrations/call/messageBroker';
import { callProUpdateIntegration } from '@/integrations/callpro/messageBroker';

jest.mock('@/integrations/facebook/messageBroker', () => ({
  facebookUpdateIntegrations: jest.fn(),
}));
jest.mock('@/integrations/instagram/messageBroker', () => ({
  instagramUpdateIntegrations: jest.fn(),
}));
jest.mock('@/integrations/mail/messageBroker', () => ({
  mailUpdateIntegration: jest.fn(),
}));
jest.mock('@/integrations/call/messageBroker', () => ({
  callUpdateIntegration: jest.fn(),
}));
jest.mock('@/integrations/callpro/messageBroker', () => ({
  callProUpdateIntegration: jest.fn(),
}));
jest.mock('@/integrations/discord/messageBroker', () => ({}));
jest.mock('../messageBroker', () => ({}));
jest.mock('erxes-api-shared/utils', () => ({ markResolvers: jest.fn() }));

beforeEach(() => jest.clearAllMocks());

test('renaming a Telegram connection returns the saved common fields without a provider update', async () => {
  const before = {
    _id: 'integration',
    kind: 'telegram-messenger',
    name: 'Old name',
  };
  const after = {
    ...before,
    name: 'Support',
    channelId: 'channel',
    brandId: 'brand',
  };
  const updateOne = jest.fn().mockResolvedValue({ modifiedCount: 1 });
  // Only the tenant model boundary is substituted; the resolver and dispatcher are real.
  const context = {
    subdomain: 'test-tenant',
    models: {
      Integrations: {
        getIntegration: jest
          .fn()
          .mockResolvedValueOnce(before)
          .mockResolvedValueOnce(after),
        updateOne,
      },
    },
  } as unknown as IContext;
  await expect(
    integrationMutations.integrationsEditCommonFields(
      null,
      {
        _id: before._id,
        name: after.name,
        details: undefined,
        channelId: after.channelId,
        brandId: after.brandId,
      },
      context,
    ),
  ).resolves.toEqual(after);
  expect(updateOne).toHaveBeenCalledWith(
    { _id: before._id },
    {
      $set: {
        name: after.name,
        details: undefined,
        channelId: after.channelId,
        brandId: after.brandId,
      },
    },
  );
});

const data = {
  kind: 'telegram-messenger',
  integrationId: 'integration',
  doc: {
    accountId: 'account',
    kind: 'telegram-messenger',
    integrationId: 'integration',
    channelId: 'channel',
  },
};
test.each([
  ['facebook', facebookUpdateIntegrations],
  ['instagram', instagramUpdateIntegrations],
  ['mail', mailUpdateIntegration],
  ['calls', callUpdateIntegration],
  ['callpro', callProUpdateIntegration],
] as const)(
  'retains the existing %s update handler',
  async (service, handler) => {
    await sendUpdateIntegration('test-tenant', service, data);
    expect(handler).toHaveBeenCalledWith({ subdomain: 'test-tenant', data });
  },
);

test('still rejects unknown update services', async () => {
  await expect(
    sendUpdateIntegration('test-tenant', 'unknown-provider', data),
  ).rejects.toThrow('Unsupported service: unknown-provider');
});
