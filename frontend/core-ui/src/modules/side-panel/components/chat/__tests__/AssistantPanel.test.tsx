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
      onWidthChange?: (width: number) => void;
    }>) => (
      <aside
        data-testid="panel"
        style={{ width: Math.min(width, maxWidth) }}
        className={`flex-none ${className ?? ''}`}
      >
        {onWidthChange && (
          <button onClick={() => onWidthChange(1000)}>Resize panel</button>
        )}
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
      mode,
      onModeChange,
    }: {
      active: boolean;
      onClose: () => void;
      mode: 'lens' | 'companion';
      onModeChange: (mode: 'lens' | 'companion') => void;
    }) => {
      const [draft, setDraft] = useState('');
      useEffect(() => {
        mockMounts += 1;
      }, []);
      return (
        <div data-testid="chat" data-active={String(active)} data-mode={mode}>
          <input
            aria-label="Draft"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
          <button
            onClick={() => onModeChange(mode === 'lens' ? 'companion' : 'lens')}
          >
            {mode === 'lens' ? 'Pin to side panel' : 'Unpin and float'}
          </button>
          <button onClick={onClose}>Close assistant</button>
        </div>
      );
    },
  };
});

beforeEach(() => {
  localStorage.clear();
  window.innerWidth = 1600;
  mockPath = null;
  mockAllowed = true;
  mockMounts = 0;
  mockClose.mockClear();
});

it('opens as Lens, switches to Companion without remounting, and preserves the draft while hidden', async () => {
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
  expect(screen.getByTestId('chat').getAttribute('data-mode')).toBe('lens');
  expect(screen.getByTestId('panel').style.width).toBe('440px');
  expect(screen.queryByRole('button', { name: 'Resize panel' })).toBeNull();
  fireEvent.change(screen.getByRole('textbox'), {
    target: { value: 'Keep this draft' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Pin to side panel' }));
  expect(screen.getByTestId('chat').getAttribute('data-mode')).toBe(
    'companion',
  );
  expect(screen.getByTestId('panel').style.width).toBe('400px');
  expect(localStorage.getItem('agent:panel-mode')).toBe('"companion"');
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
  fireEvent.click(screen.getByRole('button', { name: 'Unpin and float' }));
  expect(screen.getByTestId('chat').getAttribute('data-mode')).toBe('lens');
  expect(screen.getByTestId('panel').style.width).toBe('440px');
  expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe(
    'Keep this draft',
  );
  expect(mockMounts).toBe(1);
  fireEvent.click(screen.getByRole('button', { name: 'Close assistant' }));
  expect(mockClose).toHaveBeenCalledTimes(1);
});

it('reserves space for the page in Companion and restores the preferred width', async () => {
  localStorage.setItem('agent:panel-mode', '"companion"');
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
