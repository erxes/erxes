import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider, createStore } from 'jotai';
import { toast } from 'erxes-ui';
import { useSidePanel } from 'ui-modules';
import type { IIntegration } from '@/integrations/types/Integration';
import {
  TelegramIntegrationActions,
  TelegramSetup,
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
    Input: () => null,
    Form: Object.assign(Wrap, {
      Field: () => null,
      Item: Wrap,
      Label: Wrap,
      Control: Wrap,
      Description: Wrap,
      Message: () => null,
    }),
    Select: Object.assign(Wrap, {
      Trigger: Wrap,
      Value: () => null,
      Content: Wrap,
      Item: Wrap,
    }),
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
    isDeeplyEqual: (left: unknown, right: unknown) =>
      JSON.stringify(left) === JSON.stringify(right),
    toast: jest.fn(),
    useConfirm: () => ({ confirm: () => Promise.resolve() }),
    REACT_APP_API_URL: 'https://api.example.com',
  };
});
jest.mock('ui-modules', () => {
  const { atom, useAtom } = jest.requireActual<typeof import('jotai')>('jotai');
  const panelRecord = atom<{ contentId: string } | null>(null);
  return {
    useSidePanel: () => {
      const [record, setRecord] = useAtom(panelRecord);
      return {
        record,
        openRecord: ({ contentId }: { contentId: string }) =>
          setRecord({ contentId }),
        openNewRecord: () => setRecord({ contentId: 'new' }),
      };
    },
    SelectBrand: () => null,
  };
});
jest.mock('react-router-dom', () => ({ useParams: () => ({}) }));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('../translations', () => ({
  useTelegramTranslation: () => ({ t: (key: string) => key }),
}));

const TelegramPanel = ({ children }: PropsWithChildren) => {
  const { record } = useSidePanel();
  return (
    <>
      {children}
      {record && (
        <TelegramSetup
          integrationId={record.contentId === 'new' ? null : record.contentId}
        />
      )}
    </>
  );
};

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
