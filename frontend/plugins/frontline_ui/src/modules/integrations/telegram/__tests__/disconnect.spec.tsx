import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import type { CellContext } from '@tanstack/react-table';
import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider, createStore } from 'jotai';
import { toast } from 'erxes-ui';
import type { IIntegrationDetail } from '@/integrations/types/Integration';
import {
  TelegramIntegrationActions,
  TelegramIntegrationDetail,
} from '../TelegramIntegrationDetail';
import {
  TELEGRAM_BOTS,
  TELEGRAM_DISCONNECT,
  TELEGRAM_WEBHOOK_INFO,
} from '../graphql';

jest.mock('erxes-ui', () => {
  const Wrap = ({ children }: PropsWithChildren) => <div>{children}</div>;
  return {
    Button: ({
      children,
      onClick,
      disabled,
      type,
    }: ButtonHTMLAttributes<HTMLButtonElement>) => (
      <button type={type} onClick={onClick} disabled={disabled}>
        {children}
      </button>
    ),
    Form: Object.assign(Wrap, { Field: () => null }),
    Collapsible: Object.assign(Wrap, {
      Trigger: Wrap,
      TriggerIcon: () => null,
      Content: Wrap,
    }),
    Sheet: Object.assign(Wrap, {
      Trigger: Wrap,
      View: Wrap,
      Header: Wrap,
      Title: Wrap,
      Close: Wrap,
      Content: Wrap,
      Footer: Wrap,
    }),
    Spinner: () => <span>Loading</span>,
    toast: jest.fn(),
    useConfirm: () => ({ confirm: () => Promise.resolve() }),
    REACT_APP_API_URL: 'https://api.example.com',
  };
});
jest.mock('ui-modules', () => ({ SelectBrand: () => null }));
jest.mock('react-router', () => ({ useParams: () => ({}) }));
jest.mock('../translations', () => ({
  useTelegramTranslation: () => ({ t: (key: string) => key }),
}));

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
const cell = {
  row: { original: { _id: 'integration' } },
} as unknown as CellContext<IIntegrationDetail, unknown>;
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
          <TelegramIntegrationActions cell={cell} />
          <TelegramIntegrationDetail />
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
