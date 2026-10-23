/** @jest-environment jsdom */
import { fireEvent, render, screen } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { AssistantButton } from '../components/AssistantButton';
import { agentActivityState } from '../states/agentActivityState';

let mockPath: string | null = null;
let mockAllowed = true;
let mockShortcut: () => void;
let mockShortcutEnabled = false;
const mockOpen = jest.fn();
const mockClose = jest.fn();

jest.mock('ui-modules', () => ({
  SIDE_PANEL_CHAT_PATH: '/chat',
  usePermissionCheck: () => ({
    isLoaded: true,
    hasActionPermission: () => mockAllowed,
  }),
  useSidePanel: () => ({
    path: mockPath,
    openPath: mockOpen,
    close: mockClose,
  }),
}));
jest.mock('react-hotkeys-hook', () => ({
  useHotkeys: (
    _key: string,
    callback: () => void,
    options: { enabled: boolean },
  ) => {
    mockShortcut = callback;
    mockShortcutEnabled = options.enabled;
  },
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (_key: string, fallback: string) => fallback }),
}));
jest.mock('erxes-ui', () => ({
  cn: (...classes: (string | boolean)[]) => classes.filter(Boolean).join(' '),
  Button: ({
    variant,
    size,
    ...props
  }: ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: string;
    size?: string;
  }) => {
    void variant;
    void size;
    return <button {...props} />;
  },
}));
jest.mock(
  '@/navigation/components/core-tab/CoreTabTooltip',
  () => ({
    CoreTabTooltip: ({ children }: PropsWithChildren) => <>{children}</>,
  }),
  { virtual: true },
);

beforeEach(() => {
  jest.clearAllMocks();
  mockPath = null;
  mockAllowed = true;
});

it('opens the real Assistant route from the button and shortcut', () => {
  render(<AssistantButton />);
  fireEvent.click(screen.getByRole('button', { name: 'Assistant' }));
  expect(mockOpen).toHaveBeenCalledWith('/chat');
  expect(mockShortcutEnabled).toBe(true);
  mockShortcut();
  expect(mockOpen).toHaveBeenCalledTimes(2);
});

it('closes the Assistant route when already open', () => {
  mockPath = '/chat';
  render(<AssistantButton />);
  const button = screen.getByRole('button', { name: 'Assistant' });
  expect(button.getAttribute('aria-pressed')).toBe('true');
  fireEvent.click(button);
  expect(mockClose).toHaveBeenCalledTimes(1);
});

it('can replace a record panel with the Assistant', () => {
  mockPath = '/detail/customer/c1';
  render(<AssistantButton />);
  fireEvent.click(screen.getByRole('button', { name: 'Assistant' }));
  expect(mockOpen).toHaveBeenCalledWith('/chat');
});

it('hides the entry and disables its shortcut without permission', () => {
  mockAllowed = false;
  const { rerender } = render(<AssistantButton />);
  expect(screen.queryByRole('button')).toBeNull();
  expect(mockShortcutEnabled).toBe(false);
  mockAllowed = true;
  rerender(<AssistantButton />);
  expect(screen.getByRole('button', { name: 'Assistant' })).toBeTruthy();
  expect(mockShortcutEnabled).toBe(true);
});

it('signals an unread answer on the top-bar button', () => {
  const store = createStore();
  store.set(agentActivityState, {
    phase: 'idle',
    unread: 1,
    finishedAt: 10,
    errorAt: null,
    hasConnection: true,
  });
  render(
    <Provider store={store}>
      <AssistantButton />
    </Provider>,
  );
  expect(
    screen.getByRole('button', { name: 'Assistant, new response' }),
  ).toBeTruthy();
});
