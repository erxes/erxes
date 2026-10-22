import { sendRemoveIntegration } from '@/inbox/graphql/resolvers/mutations/integrations';
import { integrationsRouter } from '@/inbox/trpc/inbox';
import type { FrontlineTRPCContext } from '~/init-trpc';

jest.mock('@/inbox/graphql/resolvers/mutations/integrations', () => ({
  sendRemoveIntegration: jest.fn(),
}));
jest.mock('@/inbox/graphql/resolvers/mutations/conversations', () => ({
  sendNotifications: jest.fn(),
}));
jest.mock('@/inbox/graphql/resolvers/mutations/widget', () => ({
  pConversationClientMessageInserted: jest.fn(),
}));
jest.mock('@/inbox/receiveMessage', () => ({
  receiveInboxMessage: jest.fn(),
  receiveIntegrationsNotification: jest.fn(),
}));

const models = {
  Integrations: {
    getIntegration: jest.fn(),
    removeIntegration: jest.fn(),
  },
  Conversations: {
    find: jest.fn(() => ({ distinct: jest.fn().mockResolvedValue(['c-1']) })),
    deleteMany: jest.fn(),
  },
  ConversationMessages: { deleteMany: jest.fn() },
};

const caller = integrationsRouter.createCaller({
  models,
  subdomain: 'tenant',
} as unknown as FrontlineTRPCContext);

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(sendRemoveIntegration).mockResolvedValue(undefined);
});

it('runs the provider cleanup before deleting a provider integration', async () => {
  models.Integrations.getIntegration.mockResolvedValue({
    _id: 'int-1',
    kind: 'whatsapp-messenger',
  });

  await caller.remove({ _id: 'int-1' });

  expect(sendRemoveIntegration).toHaveBeenCalledWith('tenant', 'whatsapp', {
    integrationId: 'int-1',
  });
  expect(models.Integrations.removeIntegration).toHaveBeenCalledWith('int-1');
});

it('keeps the integration when the provider cleanup fails', async () => {
  models.Integrations.getIntegration.mockResolvedValue({
    _id: 'int-1',
    kind: 'facebook-messenger',
  });
  jest
    .mocked(sendRemoveIntegration)
    .mockRejectedValueOnce(new Error('Meta is down'));

  await expect(caller.remove({ _id: 'int-1' })).resolves.toMatchObject({
    status: 'error',
  });
  expect(models.Integrations.removeIntegration).not.toHaveBeenCalled();
});

it('skips the provider cleanup for lead and messenger integrations', async () => {
  models.Integrations.getIntegration.mockResolvedValue({
    _id: 'int-1',
    kind: 'messenger',
  });

  await caller.remove({ _id: 'int-1' });

  expect(sendRemoveIntegration).not.toHaveBeenCalled();
  expect(models.Integrations.removeIntegration).toHaveBeenCalledWith('int-1');
});
