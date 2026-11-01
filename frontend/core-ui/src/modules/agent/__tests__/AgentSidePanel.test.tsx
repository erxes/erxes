/** @jest-environment jsdom */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import type { ButtonHTMLAttributes, PropsWithChildren, ReactNode } from 'react';

import { AgentSidePanel } from '../components/AgentSidePanel';

let mockLocation = { pathname: '/contacts/customers', search: '' };
const mockSetPageContext = jest.fn();
const mockChat = {
  threadId: undefined,
  messages: [],
  openThread: jest.fn(),
  startNewConversation: jest.fn(),
  setPageContext: mockSetPageContext,
};

jest.mock('react-router-dom', () => ({
  Link: ({ children }: PropsWithChildren) => <a>{children}</a>,
  useLocation: () => mockLocation,
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) =>
      fallback ?? key.split('.').pop() ?? key,
  }),
}));
jest.mock('erxes-ui', () => ({
  toast: jest.fn(),
  Button: ({
    children,
    asChild,
    variant,
    size,
    ...props
  }: ButtonHTMLAttributes<HTMLButtonElement> & {
    asChild?: boolean;
    variant?: string;
    size?: string;
  }) => {
    void variant;
    void size;
    return asChild ? children : <button {...props}>{children}</button>;
  },
}));
jest.mock('ui-modules', () => ({
  SIDE_PANEL_CHAT_PATH: '/chat',
  SIDE_PANEL_QUERY_KEY: 'panel',
}));
jest.mock('../hooks/useAgentsChat', () => ({
  useAgentsChat: () => mockChat,
}));
jest.mock('../hooks/useAgentActivity', () => ({
  useAgentActivity: jest.fn(),
}));
jest.mock('../hooks/useAgentsThreads', () => ({
  useAgentsThreads: () => ({ pinnedThreads: [], threads: [] }),
}));
jest.mock('../hooks/useAgentsThreadActions', () => ({
  useAgentsThreadActions: () => ({ remove: jest.fn() }),
}));
jest.mock('../hooks/useNavigationCatalog', () => ({
  useNavigationCatalog: () => [
    { path: '/contacts/customers', label: 'Customers' },
  ],
}));
jest.mock('../components/AgentFileDropZone', () => ({
  AgentFileDropZone: ({ children }: PropsWithChildren) => <>{children}</>,
}));
jest.mock('../components/ThreadTabs', () => ({
  ThreadTabs: ({ controls }: { controls: ReactNode }) => <div>{controls}</div>,
}));
jest.mock('../components/ChatPanel', () => ({
  ChatPanel: ({ contextRow }: { contextRow: ReactNode }) => (
    <div>{contextRow}</div>
  ),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockLocation = { pathname: '/contacts/customers', search: '' };
});

it('shares the current page by default and removes it from the next request on dismiss', async () => {
  const onModeChange = jest.fn();
  render(
    <Provider store={createStore()}>
      <AgentSidePanel
        active
        mode="lens"
        onClose={jest.fn()}
        onModeChange={onModeChange}
      />
    </Provider>,
  );

  expect(screen.getByText('Viewing · Customers')).toBeTruthy();
  await waitFor(() =>
    expect(mockSetPageContext).toHaveBeenCalledWith({
      path: '/contacts/customers',
      record: undefined,
    }),
  );
  fireEvent.click(screen.getByRole('button', { name: 'Remove page context' }));
  expect(screen.queryByText('Viewing · Customers')).toBeNull();
  await waitFor(() =>
    expect(mockSetPageContext).toHaveBeenLastCalledWith(undefined),
  );
  fireEvent.click(screen.getByRole('button', { name: 'Pin to side panel' }));
  expect(onModeChange).toHaveBeenCalledWith('companion');
});

it('keeps verified record identity in the page context', async () => {
  mockLocation = {
    pathname: '/contacts/customers',
    search: '?contactId=customer-1',
  };
  const onModeChange = jest.fn();
  render(
    <Provider store={createStore()}>
      <AgentSidePanel
        active
        mode="companion"
        onClose={jest.fn()}
        onModeChange={onModeChange}
      />
    </Provider>,
  );

  expect(screen.getByText('Viewing · customer')).toBeTruthy();
  await waitFor(() =>
    expect(mockSetPageContext).toHaveBeenCalledWith({
      path: '/contacts/customers',
      record: { type: 'customer', id: 'customer-1' },
    }),
  );
  fireEvent.click(
    screen.getByRole('button', { name: 'Unpin and float over page' }),
  );
  expect(onModeChange).toHaveBeenCalledWith('lens');
});
