import '../../__tests__/fixtures/telegramMocks';
import { TelegramPanel } from '../../__tests__/fixtures/telegramPanel';
import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider, createStore } from 'jotai';
import { toast } from 'erxes-ui';
import { ADD_INTEGRATION } from '@/integrations/graphql/mutations/AddIntegration';
import {
  TelegramIntegrationDetail,
  TelegramSetup,
} from '../TelegramIntegrationDetail';
import {
  TELEGRAM_ADD_BOT,
  TELEGRAM_BOTS,
  TELEGRAM_SET_WEBHOOK,
  TELEGRAM_WEBHOOK_INFO,
} from '../graphql';

const bot = {
  __typename: 'TelegramBot',
  _id: 'saved-bot',
  botId: '123',
  erxesApiId: null,
  botUsername: 'test_bot',
  botName: 'Test',
  canJoinGroups: true,
  canReadAllGroupMessages: false,
  lastVerifiedAt: '2026-10-06',
};
beforeEach(() => jest.clearAllMocks());

test.each([false, true])(
  'resumes webhook registration after a lost create response, even when the first refresh is stale (%s)',
  async (staleRefresh) => {
    let reads = 0;
    const botsResult = jest.fn(() => {
      reads += 1;
      const linkedAfter = staleRefresh ? 3 : 2;
      const savedBot = {
        ...bot,
        erxesApiId: reads > linkedAfter ? 'integration' : null,
      };
      return { data: { telegramBots: reads === 1 ? [] : [savedBot] } };
    });
    const createMatches = jest.fn(() => true);
    const registerResult = jest.fn(() => ({
      data: { telegramSetWebhook: true },
    }));
    const store = createStore();
    const mounted = render(
      <MockedProvider
        addTypename={false}
        mocks={[
          {
            request: { query: TELEGRAM_BOTS },
            result: botsResult,
            maxUsageCount: 5,
          },
          {
            request: {
              query: TELEGRAM_ADD_BOT,
              variables: { token: '123:fake' },
            },
            result: { data: { telegramAddBot: bot } },
          },
          {
            request: { query: ADD_INTEGRATION },
            variableMatcher: createMatches,
            error: new Error('Response lost after saving'),
            maxUsageCount: 2,
          },
          {
            request: {
              query: TELEGRAM_WEBHOOK_INFO,
              variables: { _id: bot._id },
            },
            result: {
              data: {
                telegramBotWebhookInfo: {
                  url: '',
                  pendingUpdateCount: 0,
                  allowedUpdates: [],
                  lastErrorDate: null,
                  lastErrorMessage: null,
                },
              },
            },
            maxUsageCount: 5,
          },
          {
            request: {
              query: TELEGRAM_SET_WEBHOOK,
              variables: {
                _id: bot._id,
                url: `https://api.example.com/pl:frontline/telegram/receive/${bot._id}`,
              },
            },
            result: registerResult,
          },
        ]}
      >
        <Provider store={store}>
          <TelegramPanel>
            <TelegramIntegrationDetail />
          </TelegramPanel>
        </Provider>
      </MockedProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'connect' }));
    fireEvent.change(await screen.findByRole('textbox', { name: 'brandId' }), {
      target: { value: 'brand' },
    });
    fireEvent.change(screen.getByLabelText('token'), {
      target: { value: '123:fake' },
    });
    const submit = screen
      .getAllByRole('button', { name: 'connect' })
      .find((button) => button.getAttribute('type') === 'submit');
    if (!submit) throw new Error('Setup submit missing');
    fireEvent.click(submit);
    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({ description: 'Response lost after saving' }),
      ),
    );
    await waitFor(() => expect(botsResult).toHaveBeenCalledTimes(3));
    if (!staleRefresh)
      expect(screen.queryByRole('textbox', { name: 'brandId' })).toBeNull();
    await waitFor(() => expect(submit.hasAttribute('disabled')).toBe(false));
    fireEvent.click(submit);
    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith({ title: 'success' }),
    );
    expect(createMatches).toHaveBeenCalledTimes(1);
    expect(registerResult).toHaveBeenCalledTimes(1);
    mounted.unmount();
    render(
      <MockedProvider
        addTypename={false}
        mocks={[
          {
            request: { query: TELEGRAM_BOTS },
            result: { data: { telegramBots: [] } },
          },
        ]}
      >
        <Provider store={store}>
          <TelegramSetup integrationId={null} />
        </Provider>
      </MockedProvider>,
    );
    const brand = await screen.findByRole('textbox', { name: 'brandId' });
    expect((brand as HTMLInputElement).value).toBe('');
  },
);
