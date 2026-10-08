import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  PropsWithChildren,
} from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider, createStore } from 'jotai';
import { toast } from 'erxes-ui';
import { ADD_INTEGRATION } from '@/integrations/graphql/mutations/AddIntegration';
import { TelegramIntegrationDetail } from '../TelegramIntegrationDetail';
import {
  TELEGRAM_ADD_BOT,
  TELEGRAM_BOTS,
  TELEGRAM_SET_WEBHOOK,
  TELEGRAM_WEBHOOK_INFO,
} from '../graphql';

jest.mock('erxes-ui', () => {
  const { forwardRef } = jest.requireActual<typeof import('react')>('react');
  const { Controller, FormProvider } =
    jest.requireActual<typeof import('react-hook-form')>('react-hook-form');
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
    Input: forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
      (props, ref) => <input {...props} ref={ref} aria-label={props.name} />,
    ),
    Form: Object.assign(FormProvider, {
      Field: Controller,
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
    Sheet: Object.assign(
      ({
        children,
        onOpenChange,
      }: PropsWithChildren<{ onOpenChange: (open: boolean) => void }>) => (
        <div>
          <button onClick={() => onOpenChange(true)}>Open setup</button>
          {children}
        </div>
      ),
      {
        Trigger: Wrap,
        View: Wrap,
        Header: Wrap,
        Title: Wrap,
        Close: Wrap,
        Content: Wrap,
        Footer: Wrap,
      },
    ),
    Spinner: () => <span>Loading</span>,
    toast: jest.fn(),
    useConfirm: () => ({ confirm: () => Promise.resolve() }),
    REACT_APP_API_URL: 'https://api.example.com',
  };
});
jest.mock('ui-modules', () => ({
  SelectBrand: ({
    value,
    onValueChange,
  }: {
    value: string;
    onValueChange: (value: string) => void;
  }) => (
    <input
      aria-label="brandId"
      value={value}
      onChange={(event) => onValueChange(event.target.value)}
    />
  ),
}));
jest.mock('react-router', () => ({ useParams: () => ({}) }));
jest.mock('../translations', () => ({
  useTelegramTranslation: () => ({ t: (key: string) => key }),
}));

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
    const botsResult = jest.fn(() => ({
      data: {
        telegramBots:
          ++reads === 1
            ? []
            : [
                {
                  ...bot,
                  erxesApiId:
                    reads > (staleRefresh ? 3 : 2) ? 'integration' : null,
                },
              ],
      },
    }));
    const createMatches = jest.fn(() => true);
    const registerResult = jest.fn(() => ({
      data: { telegramSetWebhook: true },
    }));
    render(
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
        <Provider store={createStore()}>
          <TelegramIntegrationDetail />
        </Provider>
      </MockedProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open setup' }));
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
  },
);
