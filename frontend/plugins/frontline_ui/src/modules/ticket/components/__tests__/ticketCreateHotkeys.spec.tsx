import { fireEvent, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useScopedHotkeys } from 'erxes-ui';
import { TicketHotKeyScope } from '@/ticket/types/ticketHotkeyScope';
import { TicketPageEffect } from '../TicketPageEffect';

let mockRecord: { contentType: string; contentId: string } | null;
let mockScope: string;
const mockCreate = jest.fn();
const mockSetScope = jest.fn((scope: string) => {
  mockScope = scope;
});

jest.mock('react-router-dom', () => {
  const { TextEncoder, TextDecoder } =
    jest.requireActual<typeof import('node:util')>('node:util');
  Object.assign(globalThis, { TextEncoder, TextDecoder });
  return jest.requireActual<typeof import('react-router-dom')>(
    'react-router-dom',
  );
});
jest.mock('ui-modules', () => ({
  NEW_RECORD_ID: 'new',
  useSidePanel: () => ({ record: mockRecord }),
}));
jest.mock('erxes-ui', () => {
  const { useCallback } = jest.requireActual<typeof import('react')>('react');
  const { useLocation, matchPath } =
    jest.requireActual<typeof import('react-router-dom')>('react-router-dom');
  const { useHotkeys } =
    jest.requireActual<typeof import('react-hotkeys-hook')>(
      'react-hotkeys-hook',
    );
  return {
    useSetHotkeyScope: () => mockSetScope,
    useIsMatchingLocation: (basePath: string) => {
      const { pathname } = useLocation();
      return useCallback(
        (path: string) => Boolean(matchPath(basePath + path, pathname)),
        [pathname, basePath],
      );
    },
    useScopedHotkeys: (
      ...[keys, callback, scope, dependencies]: Parameters<
        (typeof import('erxes-ui'))['useScopedHotkeys']
      >
    ) =>
      useHotkeys(
        keys,
        (event, hotkeysEvent) => {
          if (mockScope === scope) callback(event, hotkeysEvent);
        },
        {},
        dependencies,
      ),
  };
});

const PageShortcut = () => {
  useScopedHotkeys('c', mockCreate, TicketHotKeyScope.TicketPage, []);
  return <TicketPageEffect />;
};

beforeEach(() => {
  jest.clearAllMocks();
  mockRecord = null;
  mockScope = '';
});

it.each<{ action: string; nextRecord: typeof mockRecord }>([
  { action: 'cancelling', nextRecord: null },
  {
    action: 'saving',
    nextRecord: { contentType: 'frontline:ticket', contentId: 'saved-ticket' },
  },
])(
  'restores the C shortcut after $action a draft that used a filter or table popover',
  ({ nextRecord }) => {
    const page = () => (
      <MemoryRouter initialEntries={['/frontline/tickets']}>
        <PageShortcut />
      </MemoryRouter>
    );
    const { rerender } = render(page());
    mockRecord = { contentType: 'frontline:ticket', contentId: 'new' };
    mockScope = TicketHotKeyScope.TicketAddSheet;
    rerender(page());
    expect(mockScope).toBe(TicketHotKeyScope.TicketAddSheet);

    // Nested scoped popovers remember the draft scope as their previous scope.
    mockScope = 'TicketPage.FilterPopover';
    mockScope = TicketHotKeyScope.TicketAddSheet;
    mockRecord = nextRecord;
    rerender(page());
    fireEvent.keyDown(document.body, { key: 'c', code: 'KeyC' });
    fireEvent.keyUp(document.body, { key: 'c', code: 'KeyC' });
    expect(mockCreate).toHaveBeenCalledTimes(1);
  },
);

it('leaves another plugin page hotkey scope alone', () => {
  mockScope = 'Contacts';
  render(
    <MemoryRouter initialEntries={['/contacts/customers']}>
      <PageShortcut />
    </MemoryRouter>,
  );
  expect(mockSetScope).not.toHaveBeenCalled();
  expect(mockScope).toBe('Contacts');
});
