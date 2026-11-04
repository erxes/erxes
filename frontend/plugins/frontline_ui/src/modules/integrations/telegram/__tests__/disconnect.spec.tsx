import '../../__tests__/fixtures/telegramMocks';
import { TelegramPanel } from '../../__tests__/fixtures/telegramPanel';
import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider, createStore } from 'jotai';
import { toast } from 'erxes-ui';
import type { IIntegration } from '@/integrations/types/Integration';
import { TelegramIntegrationActions } from '../TelegramIntegrationDetail';
import {
  TELEGRAM_BOTS,
  TELEGRAM_DISCONNECT,
  TELEGRAM_WEBHOOK_INFO,
} from '../graphql';

const bot = {
  __typename: 'TelegramBot',
  _id: 'saved-bot',
  botId: '123',
  erxesApiId: 'integration',
  botUsername: 'test_bot',
  botName: 'Test',
  canJoinGroups: true,
  canReadAllGroupMessages: false,
  lastVerifiedAt: '2026-10-06',
};
const integration: IIntegration = {
  _id: 'integration',
  name: 'Telegram',
  kind: 'telegram',
  isActive: true,
  brandId: null,
  channelId: null,
  healthStatus: null,
  facebookPage: null,
};
beforeEach(() => jest.clearAllMocks());

test.each([true, false])(
  'can disconnect after status failure and reports remote cleanup accurately (%s)',
  async (webhookRemoved) => {
    const botsResult = jest.fn(() => ({ data: { telegramBots: [bot] } }));
    const disconnectResult = jest.fn(() => ({
      data: { telegramDisconnectBot: webhookRemoved },
    }));
    render(
      <MockedProvider
        addTypename={false}
        mocks={[
          {
            request: { query: TELEGRAM_BOTS },
            result: botsResult,
            maxUsageCount: 2,
          },
          {
            request: {
              query: TELEGRAM_WEBHOOK_INFO,
              variables: { _id: bot._id },
            },
            error: new Error('Token revoked'),
            maxUsageCount: 2,
          },
          {
            request: {
              query: TELEGRAM_DISCONNECT,
              variables: { _id: bot._id },
            },
            result: disconnectResult,
          },
        ]}
      >
        <Provider store={createStore()}>
          <TelegramPanel>
            <TelegramIntegrationActions integration={integration} />
          </TelegramPanel>
        </Provider>
      </MockedProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'configure' }));
    await waitFor(() =>
      expect(screen.getByRole('alert').textContent).toBe('statusFailed'),
    );
    const disconnect = screen.getByRole('button', { name: 'disconnect' });
    expect(disconnect.hasAttribute('disabled')).toBe(false);
    fireEvent.click(disconnect);
    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith({
        title: 'disconnected',
        description: webhookRemoved ? undefined : 'disconnectCleanupPending',
      }),
    );
    expect(disconnectResult).toHaveBeenCalledTimes(1);
    expect(botsResult).toHaveBeenCalledTimes(2);
    expect(toast).not.toHaveBeenCalledWith(
      expect.objectContaining({ title: 'failed' }),
    );
  },
);
