import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { AddTransaction } from '@/transactions/components/AddTransaction';
import { TrJournalEnum } from '@/transactions/types/constants';

jest.mock('react-router', () => {
  const { TextDecoder, TextEncoder } =
    jest.requireActual<typeof import('util')>('util');
  Object.assign(globalThis, { TextDecoder, TextEncoder });
  return jest.requireActual('react-router');
});

jest.mock('react-merge-refs', () => ({
  mergeRefs:
    (refs: React.Ref<unknown>[]) =>
    (value: unknown): void => {
      refs.forEach((ref) => {
        if (typeof ref === 'function') {
          ref(value);
        } else if (ref) {
          (ref as React.MutableRefObject<unknown>).current = value;
        }
      });
    },
}));

let mockPressHotkey: () => void = () => undefined;

jest.mock('erxes-ui', () => ({
  ...jest.requireActual('erxes-ui/components/command'),
  ...jest.requireActual('erxes-ui/components/popover'),
  usePreviousHotkeyScope: () => ({
    setHotkeyScopeAndMemorizePreviousScope: jest.fn(),
    goBackToPreviousHotkeyScope: jest.fn(),
  }),
  useScopedHotkeys: (_keys: string, callback: () => void) => {
    mockPressHotkey = callback;
  },
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('@/settings/account/components/SelectAccount', () => ({
  SelectAccount: ({
    onCallback,
  }: {
    onCallback: (account: { journal: string; kind: string }) => void;
  }) => (
    <button onClick={() => onCallback({ journal: 'bank', kind: 'active' })}>
      pick-account
    </button>
  ),
}));

const CurrentLocation = () => {
  const { pathname, search } = useLocation();
  return <output>{`${pathname}${search}`}</output>;
};

const renderMenu = (
  props: Partial<Parameters<typeof AddTransaction>[0]> = {},
  listPath = '/accounting/main',
) =>
  render(
    <MemoryRouter initialEntries={[listPath]}>
      <AddTransaction {...props}>
        <button>open-menu</button>
      </AddTransaction>
      <CurrentLocation />
    </MemoryRouter>,
  );

const openMenu = () => fireEvent.click(screen.getByText('open-menu'));

const menu = () => within(screen.getByRole('dialog'));

const currentPath = () =>
  screen.getByRole('status', { hidden: true }).textContent;

const search = (value: string) =>
  fireEvent.change(menu().getByPlaceholderText('search-type'), {
    target: { value },
  });

const groupOf = (label: string) =>
  within(menu().getByRole('group', { name: label }));

beforeAll(() => {
  global.ResizeObserver = jest.fn(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));
  Element.prototype.scrollIntoView = jest.fn();
});

describe('add transaction menu', () => {
  test('shows its title above the search', () => {
    renderMenu();
    openMenu();

    expect(menu().getByText('add-transaction-label')).toBeTruthy();
  });

  test('clicking bank opens the create page for that journal and closes', () => {
    renderMenu();
    openMenu();

    fireEvent.click(menu().getByRole('link', { name: 'bank' }));

    expect(currentPath()).toBe(
      '/accounting/transaction/create?defaultJournal=bank&returnTo=%2Faccounting%2Fmain',
    );
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  test('remembers the filtered Journal entries list it was opened from', () => {
    renderMenu({}, '/accounting/records?journal=cash&accountId=acc-1101');
    openMenu();

    fireEvent.click(menu().getByRole('link', { name: 'bank' }));

    expect(currentPath()).toBe(
      `/accounting/transaction/create?defaultJournal=bank&returnTo=${encodeURIComponent(
        '/accounting/records?journal=cash&accountId=acc-1101',
      )}`,
    );
  });

  test('searching then pressing enter opens the first match', () => {
    renderMenu();
    openMenu();

    search('bank');
    fireEvent.keyDown(menu().getByPlaceholderText('search-type'), {
      key: 'Enter',
    });

    expect(currentPath()).toBe(
      '/accounting/transaction/create?defaultJournal=bank&returnTo=%2Faccounting%2Fmain',
    );
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  test('the two receipt items link to their own journals', () => {
    renderMenu();
    openMenu();

    expect(
      groupOf('fixed-asset')
        .getByRole('link', { name: 'receipt' })
        .getAttribute('href'),
    ).toContain(`defaultJournal=${TrJournalEnum.FXA_INCOME}`);
    expect(
      groupOf('inventory-label')
        .getByRole('link', { name: 'receipt' })
        .getAttribute('href'),
    ).toContain(`defaultJournal=${TrJournalEnum.INV_INCOME}`);
  });

  test('typing narrows the list to what matches', () => {
    renderMenu();
    openMenu();

    search('bank');

    expect(menu().getByRole('link', { name: 'bank' })).toBeTruthy();
    expect(menu().queryByRole('link', { name: 'sale' })).toBeNull();
  });

  test('a search with no match says so', () => {
    renderMenu();
    openMenu();

    search('qqqqq');

    expect(menu().getByText('no-results-found')).toBeTruthy();
  });

  test('tax can only be filtered, so it is not offered here', () => {
    renderMenu();
    openMenu();

    expect(menu().queryByText('tax')).toBeNull();
  });

  test('adjustment stays visible but does nothing when clicked', () => {
    renderMenu();
    openMenu();

    fireEvent.click(menu().getByText('adjustment'));

    expect(currentPath()).toBe('/accounting/main');
    expect(screen.getByRole('dialog')).toBeTruthy();
  });

  test('inside a transaction form a journal is added as a tab instead of navigating', () => {
    const onClick = jest.fn();
    renderMenu({ inForm: true, onClick });
    openMenu();

    fireEvent.click(menu().getByText('bank'));

    expect(onClick).toHaveBeenCalledWith(TrJournalEnum.BANK);
    expect(currentPath()).toBe('/accounting/main');
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  test('inside a transaction form an internal transfer cannot be added', () => {
    renderMenu({ inForm: true });
    openMenu();

    expect(menu().queryByText('internal-transfer')).toBeNull();
  });

  test('inside a transaction form picking an account adds it with its journal', () => {
    const onClick = jest.fn();
    renderMenu({ inForm: true, onClick });
    openMenu();

    fireEvent.click(menu().getByText('pick-account'));

    expect(onClick).toHaveBeenCalledWith(
      TrJournalEnum.BANK,
      expect.objectContaining({ journal: 'bank' }),
    );
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  test('the account search is not shown outside a transaction form', () => {
    renderMenu();
    openMenu();

    expect(menu().queryByText('pick-account')).toBeNull();
  });

  test('pressing c opens the menu', () => {
    renderMenu();

    act(() => mockPressHotkey());

    expect(screen.getByRole('dialog')).toBeTruthy();
  });

  test('pressing c does nothing where the hotkey is turned off', () => {
    renderMenu({ disableHotkey: true });

    act(() => mockPressHotkey());

    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
