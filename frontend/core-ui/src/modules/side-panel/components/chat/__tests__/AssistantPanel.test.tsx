/** @jest-environment jsdom */
import { fireEvent, render, screen } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import type { PropsWithChildren } from 'react';
import { AssistantPanel } from '../AssistantPanel';

let mockPath: string | null = null;
let mockAllowed = true;
let mockMounts = 0;
const mockClose = jest.fn();
jest.mock('ui-modules', () => {
  const { atom } = jest.requireActual<typeof import('jotai')>('jotai');
  return {
    SIDE_PANEL_CHAT_PATH: '/chat',
    sidePanelWidthState: atom(400),
    usePermissionCheck: () => ({
      isLoaded: true,
      hasActionPermission: () => mockAllowed,
    }),
    useSidePanel: () => ({
      path: mockPath,
      open: !!mockPath,
      close: mockClose,
    }),
    RecordSidePanel: ({
      children,
      width,
      maxWidth,
      className,
      onWidthChange,
    }: PropsWithChildren<{
      width: number;
      maxWidth: number;
      className?: string;
      onWidthChange: (width: number) => void;
    }>) => (
      <aside
        data-testid="panel"
        style={{ width: Math.min(width, maxWidth) }}
        className={`flex-none ${className ?? ''}`}
      >
        <button onClick={() => onWidthChange(1000)}>Resize panel</button>
        {children}
      </aside>
    ),
  };
});
jest.mock('erxes-ui', () => ({
  cn: (...classes: (string | boolean)[]) => classes.filter(Boolean).join(' '),
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (_key: string, fallback: string) => fallback }),
}));
jest.mock('../SidePanelChat', () => {
  const { useEffect, useState } =
    jest.requireActual<typeof import('react')>('react');
  return {
    SidePanelChat: ({
      active,
      onClose,
    }: {
      active: boolean;
      onClose: () => void;
    }) => {
      const [draft, setDraft] = useState('');
      useEffect(() => {
        mockMounts += 1;
      }, []);
      return (
        <div data-testid="chat" data-active={String(active)}>
          <input
            aria-label="Draft"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
          <button onClick={onClose}>Close assistant</button>
        </div>
      );
    },
  };
});

beforeEach(() => {
  window.innerWidth = 1600;
  mockPath = null;
  mockAllowed = true;
  mockMounts = 0;
  mockClose.mockClear();
});

it('loads only on first open, occupies a normal layout column, and keeps the same chat and draft while hidden', async () => {
  const store = createStore();
  const { rerender } = render(
    <Provider store={store}>
      <AssistantPanel />
    </Provider>,
  );
  expect(screen.queryByTestId('panel')).toBeNull();
  mockPath = '/chat';
  rerender(
    <Provider store={store}>
      <AssistantPanel />
    </Provider>,
  );
  await screen.findByTestId('chat');
  expect(screen.getByTestId('panel').className).toContain('flex-none');
  expect(screen.getByTestId('panel').style.width).toBe('400px');
  fireEvent.change(screen.getByRole('textbox'), {
    target: { value: 'Keep this draft' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Resize panel' }));
  expect(screen.getByTestId('panel').style.width).toBe('1000px');
  mockPath = null;
  rerender(
    <Provider store={store}>
      <AssistantPanel />
    </Provider>,
  );
  expect(
    screen.getByTestId('panel').parentElement?.getAttribute('aria-hidden'),
  ).toBe('true');
  expect(screen.getByTestId('panel').parentElement?.hasAttribute('inert')).toBe(
    true,
  );
  expect(screen.getByTestId('chat').getAttribute('data-active')).toBe('false');
  mockPath = '/detail/customer/c1';
  rerender(
    <Provider store={store}>
      <AssistantPanel />
    </Provider>,
  );
  expect(
    screen.getByTestId('panel').parentElement?.getAttribute('aria-hidden'),
  ).toBe('true');
  expect(screen.getByTestId('panel').parentElement?.hasAttribute('inert')).toBe(
    true,
  );
  mockPath = '/chat';
  rerender(
    <Provider store={store}>
      <AssistantPanel />
    </Provider>,
  );
  expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe(
    'Keep this draft',
  );
  expect(
    screen.getByTestId('panel').parentElement?.getAttribute('aria-hidden'),
  ).toBe('false');
  expect(screen.getByTestId('panel').parentElement?.hasAttribute('inert')).toBe(
    false,
  );
  expect(mockMounts).toBe(1);
  expect(screen.getByTestId('panel').style.width).toBe('1000px');
  fireEvent.click(screen.getByRole('button', { name: 'Close assistant' }));
  expect(mockClose).toHaveBeenCalledTimes(1);
});

it('reserves space for the page on smaller windows and restores the preferred width', async () => {
  mockPath = '/chat';
  render(<AssistantPanel />);
  await screen.findByTestId('chat');
  fireEvent.click(screen.getByRole('button', { name: 'Resize panel' }));
  expect(screen.getByTestId('panel').style.width).toBe('1000px');
  window.innerWidth = 1000;
  fireEvent(window, new Event('resize'));
  expect(screen.getByTestId('panel').style.width).toBe('680px');
  window.innerWidth = 1600;
  fireEvent(window, new Event('resize'));
  expect(screen.getByTestId('panel').style.width).toBe('1000px');
});

it('never mounts chat without permission', () => {
  mockPath = '/chat';
  mockAllowed = false;
  render(<AssistantPanel />);
  expect(screen.queryByTestId('panel')).toBeNull();
  expect(mockMounts).toBe(0);
});
