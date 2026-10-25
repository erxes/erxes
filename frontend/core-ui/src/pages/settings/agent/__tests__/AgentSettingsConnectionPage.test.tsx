/** @jest-environment jsdom */
import { MockedProvider } from '@apollo/client/testing';
import type { MockedResponse } from '@apollo/client/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { GraphQLError } from 'graphql';
import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { toast } from 'erxes-ui';

import {
  AGENTS_CONNECTIONS,
  AGENTS_CONNECTION_SET_DEFAULT,
} from '@/agent/graphql/connection';
import type { IAgentsConnectionEntry } from '@/agent/graphql/connection';
import { AgentSettingsConnectionPage } from '../AgentSettingsConnectionPage';

// Lightweight stand-ins keep this test on the page's own behavior.
jest.mock('react-router-dom', () => ({
  Link: ({ children }: PropsWithChildren) => <a href="/">{children}</a>,
}));
jest.mock('erxes-ui', () => {
  const Pass = ({ children }: PropsWithChildren) => <>{children}</>;
  const Button = ({
    children,
    disabled,
    onClick,
    'aria-label': ariaLabel,
  }: ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
  return {
    AlertDialog: Object.assign(() => null, {
      Content: Pass,
      Header: Pass,
      Title: Pass,
      Description: Pass,
      Footer: Pass,
      Cancel: Pass,
      Action: Pass,
    }),
    Badge: ({ children }: PropsWithChildren) => <span>{children}</span>,
    Breadcrumb: Object.assign(Pass, {
      List: Pass,
      Item: Pass,
      Separator: () => null,
    }),
    Button,
    Input: () => <input />,
    Label: Pass,
    Separator: { Inline: () => null },
    Spinner: () => <span role="progressbar" />,
    buttonVariants: () => '',
    formatDateISOStringToRelativeDate: () => '',
    toast: jest.fn(),
  };
});
jest.mock('ui-modules', () => {
  const Pass = ({ children }: PropsWithChildren) => <>{children}</>;
  return {
    PageHeader: Object.assign(Pass, {
      Start: Pass,
      FavoriteToggleButton: () => null,
    }),
    SIDE_PANEL_CHAT_PATH: '/chat',
    useSidePanel: () => ({ openPath: jest.fn() }),
  };
});

const entry = (
  provider: string,
  model: string,
  isDefault: boolean,
): IAgentsConnectionEntry => ({
  provider,
  model,
  hasKey: true,
  isDefault,
  updatedAt: null,
});
const connectionsMock = (
  connections: IAgentsConnectionEntry[],
): MockedResponse => ({
  request: { query: AGENTS_CONNECTIONS },
  result: { data: { agentsConnections: connections } },
});

const renderPage = (mocks: MockedResponse[]) =>
  render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <AgentSettingsConnectionPage />
    </MockedProvider>,
  );

beforeEach(() => jest.mocked(toast).mockClear());

it('marks the default connection and sets another one with immediate refetch', async () => {
  const setDefault = jest.fn(() => ({
    data: {
      agentsConnectionSetDefault: [
        entry('openai', 'gpt-5.6-luna', false),
        entry('kimi', 'kimi-k3', true),
      ],
    },
  }));
  renderPage([
    connectionsMock([
      entry('openai', 'gpt-5.6-luna', true),
      entry('kimi', 'kimi-k3', false),
    ]),
    {
      request: {
        query: AGENTS_CONNECTION_SET_DEFAULT,
        variables: { provider: 'kimi' },
      },
      result: setDefault,
    },
    connectionsMock([
      entry('openai', 'gpt-5.6-luna', false),
      entry('kimi', 'kimi-k3', true),
    ]),
  ]);

  expect(await screen.findByText('Default')).toBeTruthy();
  expect(
    screen.queryByRole('button', { name: 'Set OpenAI as default' }),
  ).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Set Kimi as default' }));

  await waitFor(() =>
    expect(toast).toHaveBeenCalledWith({ title: 'Default provider updated' }),
  );
  expect(setDefault).toHaveBeenCalledTimes(1);
  expect(
    await screen.findByRole('button', { name: 'Set OpenAI as default' }),
  ).toBeTruthy();
  expect(
    screen.queryByRole('button', { name: 'Set Kimi as default' }),
  ).toBeNull();
});

it('falls back to marking the first connection when none is flagged', async () => {
  renderPage([
    connectionsMock([
      { ...entry('grok', 'grok-4.5', false), isDefault: null },
      { ...entry('kimi', 'kimi-k3', false), isDefault: null },
    ]),
  ]);

  expect(
    await screen.findByRole('button', { name: 'Set Kimi as default' }),
  ).toBeTruthy();
  expect(
    screen.queryByRole('button', { name: 'Set Grok as default' }),
  ).toBeNull();
  expect(screen.getByText('Default')).toBeTruthy();
});

it('reports a failed default change and keeps the current default', async () => {
  renderPage([
    connectionsMock([
      entry('openai', 'gpt-5.6-luna', true),
      entry('kimi', 'kimi-k3', false),
    ]),
    {
      request: {
        query: AGENTS_CONNECTION_SET_DEFAULT,
        variables: { provider: 'kimi' },
      },
      result: { errors: [new GraphQLError('No connection stored')] },
    },
  ]);

  fireEvent.click(
    await screen.findByRole('button', { name: 'Set Kimi as default' }),
  );

  await waitFor(() =>
    expect(toast).toHaveBeenCalledWith({
      title: 'Failed to set the default provider',
      description: 'No connection stored',
      variant: 'destructive',
    }),
  );
  expect(
    screen.getByRole('button', { name: 'Set Kimi as default' }),
  ).toBeTruthy();
});
