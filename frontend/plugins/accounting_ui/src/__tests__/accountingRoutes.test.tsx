import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AccountingEntry from '@/AccountingMain';
import { MainNavigation } from '@/MainNavigation';

type LocaleTree = { [key: string]: string | LocaleTree };

const readLocale = (namespace: string): LocaleTree =>
  JSON.parse(
    readFileSync(
      resolve(
        __dirname,
        '../../../../../backend/gateway/src/locales/en',
        `${namespace}.json`,
      ),
      'utf8',
    ),
  );

const mockLocales: Record<string, LocaleTree> = {
  accounting: readLocale('accounting'),
  common: readLocale('common'),
};

jest.mock('react-router', () => {
  const { TextDecoder, TextEncoder } =
    jest.requireActual<typeof import('util')>('util');
  Object.assign(globalThis, { TextDecoder, TextEncoder });
  return jest.requireActual('react-router');
});

jest.mock('react-i18next', () => ({
  useTranslation: (
    namespace = 'accounting',
    options?: { keyPrefix?: string },
  ) => ({
    t: (key: string) => {
      const scope = options?.keyPrefix
        ? mockLocales[namespace][options.keyPrefix]
        : mockLocales[namespace];
      const value = typeof scope === 'object' ? scope[key] : undefined;
      return typeof value === 'string' ? value : key;
    },
  }),
}));

jest.mock('erxes-ui', () => {
  const { atom } = jest.requireActual('jotai');
  const { cloneElement } = jest.requireActual('react');
  const { Link } = jest.requireActual('react-router-dom');
  const Passthrough = ({ children }: { children?: React.ReactNode }) => (
    <div>{children}</div>
  );
  const Button = ({
    asChild,
    children,
  }: {
    asChild?: boolean;
    children: React.ReactElement;
  }) => (asChild ? cloneElement(children) : <button>{children}</button>);

  return {
    AppLayout: ({
      sidebar,
      children,
    }: {
      sidebar: React.ReactNode;
      children: React.ReactNode;
    }) => (
      <div>
        <nav>{sidebar}</nav>
        <main>{children}</main>
      </div>
    ),
    Breadcrumb: Object.assign(Passthrough, {
      List: Passthrough,
      Item: Passthrough,
      Separator: () => null,
    }),
    Button,
    Empty: Object.assign(Passthrough, {
      Header: Passthrough,
      Media: Passthrough,
      Title: Passthrough,
      Description: Passthrough,
      Content: Passthrough,
    }),
    Filter: Passthrough,
    PageContainer: Passthrough,
    NavigationMenuLinkItem: ({
      name,
      path,
      pathPrefix,
    }: {
      name: string;
      path: string;
      pathPrefix: string;
    }) => <Link to={`/${pathPrefix}/${path}`}>{name}</Link>,
    Separator: { Inline: () => null },
    Spinner: () => <span>loading</span>,
    cn: (...classNames: unknown[]) => classNames.filter(Boolean).join(' '),
    sidebarPanelOpenState: atom(false),
  };
});

jest.mock('ui-modules', () => {
  const Passthrough = ({ children }: { children?: React.ReactNode }) => (
    <div>{children}</div>
  );

  return {
    PageHeader: Object.assign(Passthrough, {
      Start: Passthrough,
      End: Passthrough,
      FavoriteToggleButton: () => null,
    }),
    PluginSettingsRoutes: Passthrough,
    SettingsHeader: Passthrough,
    createFavoriteBreadcrumb: () => [],
  };
});

jest.mock('~/Sidebar', () => {
  const { MainNavigation: Navigation } = jest.requireActual('@/MainNavigation');
  const Passthrough = ({ children }: { children?: React.ReactNode }) => (
    <div>{children}</div>
  );

  return {
    AccountingSidebar: Navigation,
    AccountingSidebarFooter: () => null,
    AccountingSettingsLayout: Passthrough,
  };
});
jest.mock('@/app/AccountingPageChangeEffect', () => ({
  PageChangeEffect: () => null,
}));
jest.mock('@/settings/components/AccountSettingsBreadcrumb', () => ({
  AccountSettingsBreadcrumb: () => null,
}));
jest.mock('@/settings/components/AccountingTopbar', () => ({
  AccountingTopbar: () => null,
}));
const ListPage = ({ title }: { title: string }) => {
  const { search } = jest
    .requireActual<typeof import('react-router-dom')>('react-router-dom')
    .useLocation();
  return (
    <>
      <h2>{title}</h2>
      <output aria-label="list filters">{search}</output>
    </>
  );
};

jest.mock('~/pages/TransactionListPage', () => ({
  TransactionListPage: () => <ListPage title="Transactions list" />,
}));
jest.mock('~/pages/TrRecordListPage', () => ({
  TrRecordListPage: () => <ListPage title="Journal entries list" />,
}));
jest.mock(
  '@/transactions/transaction-form/components/TransactionsGroupForm',
  () => ({
    TransactionsGroupForm: () => <h2>Transaction detail</h2>,
  }),
);
jest.mock('~/pages/JournalReports', () => ({
  JournalReports: () => <h2>Journal reports</h2>,
}));
jest.mock('@/check-synced/AccountingCheckSync', () => ({
  AccountingCheckSync: () => <h2>Check sync</h2>,
}));
jest.mock('~/pages/SettingsPage', () => ({
  SettingsPage: () => <h2>Accounting settings</h2>,
}));

const renderAccountingAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/accounting/*" element={<AccountingEntry />} />
      </Routes>
    </MemoryRouter>,
  );

const notFoundHeading = () =>
  screen.findByRole('heading', { name: 'Oops! Page not found.' });

const sidebarHrefs = () => {
  const { container, unmount } = render(
    <MemoryRouter>
      <MainNavigation />
    </MemoryRouter>,
  );
  const hrefs = Array.from(container.querySelectorAll('a')).map((link) =>
    link.getAttribute('href'),
  );
  unmount();
  return hrefs;
};

describe('accounting routes', () => {
  it('shows a not-found page with a way back for the old incomplete transactions address', async () => {
    renderAccountingAt('/accounting/odd-transactions');

    expect(await notFoundHeading()).toBeTruthy();
    expect(
      screen.getByRole('link', { name: /Go back/ }).getAttribute('href'),
    ).toBe('/accounting/main');
  });

  it('shows a not-found page for a mistyped accounting address and goes back to transactions', async () => {
    renderAccountingAt('/accounting/transactoins');

    await notFoundHeading();
    fireEvent.click(screen.getByRole('link', { name: /Go back/ }));

    expect(await screen.findByText('Transactions list')).toBeTruthy();
    expect(screen.queryByText('Oops! Page not found.')).toBeNull();
  });

  it('shows a not-found page for an unknown settings address with a way back to settings', async () => {
    renderAccountingAt('/accounting/settings/config/unknown');

    await notFoundHeading();
    fireEvent.click(screen.getByRole('link', { name: /Go back/ }));

    expect(await screen.findByText('Accounting settings')).toBeTruthy();
  });

  it('no longer offers incomplete transactions in the sidebar', () => {
    renderAccountingAt('/accounting/main');

    expect(
      screen.queryByRole('link', { name: 'Incomplete transactions' }),
    ).toBeNull();
  });

  it.each([
    {
      list: '/accounting/main?branchId=branch-1&journal=bank&page=2',
      back: 'Transactions',
      landing: 'Transactions list',
    },
    {
      list: '/accounting/records?journal=cash&accountId=acc-1101',
      back: 'Journal entries',
      landing: 'Journal entries list',
    },
  ])(
    'goes back from a transaction detail to the filtered $landing',
    async ({ list, back, landing }) => {
      renderAccountingAt(
        `/accounting/transaction/edit?parentId=parent-7&trId=tr-7&returnTo=${encodeURIComponent(
          list,
        )}`,
      );

      await screen.findByText('Transaction detail');
      const header = within(screen.getByRole('main'));
      expect(
        header.getByRole('link', { name: back }).getAttribute('href'),
      ).toBe(list);

      fireEvent.click(header.getByRole('link', { name: 'Back' }));

      expect(await screen.findByText(landing)).toBeTruthy();
      expect(screen.getByLabelText('list filters').textContent).toBe(
        `?${list.split('?')[1]}`,
      );
    },
  );

  it('goes back to the filtered list opened from the accounting home address', async () => {
    renderAccountingAt(
      `/accounting/transaction/edit?parentId=parent-7&returnTo=${encodeURIComponent(
        '/accounting?branchId=branch-1&journal=cash',
      )}`,
    );

    await screen.findByText('Transaction detail');
    fireEvent.click(
      within(screen.getByRole('main')).getByRole('link', { name: 'Back' }),
    );

    expect(await screen.findByText('Transactions list')).toBeTruthy();
    expect(screen.getByLabelText('list filters').textContent).toBe(
      '?branchId=branch-1&journal=cash',
    );
  });

  it('goes back from a new voucher form to the filtered Journal entries list', async () => {
    renderAccountingAt(
      `/accounting/transaction/create?defaultJournal=cash&returnTo=${encodeURIComponent(
        '/accounting/records?journal=cash',
      )}`,
    );

    await screen.findByText('Transaction detail');
    const header = within(screen.getByRole('main'));
    expect(
      header
        .getByRole('link', { name: 'Journal entries' })
        .getAttribute('href'),
    ).toBe('/accounting/records?journal=cash');

    fireEvent.click(header.getByRole('link', { name: 'Back' }));

    expect(await screen.findByText('Journal entries list')).toBeTruthy();
    expect(screen.getByLabelText('list filters').textContent).toBe(
      '?journal=cash',
    );
  });

  it.each([
    ['without a remembered list', '/accounting/transaction/edit?parentId=p-1'],
    [
      'with an outside address as the return target',
      `/accounting/transaction/edit?parentId=p-1&returnTo=${encodeURIComponent(
        'https://evil.example/accounting/main?branchId=b-1',
      )}`,
    ],
    [
      'with another accounting page as the return target',
      `/accounting/transaction/edit?parentId=p-1&returnTo=${encodeURIComponent(
        '/accounting/settings/config',
      )}`,
    ],
  ])(
    'goes back to the unfiltered transactions list %s',
    async (_case, path) => {
      renderAccountingAt(path);

      await screen.findByText('Transaction detail');
      const header = within(screen.getByRole('main'));
      expect(
        header.getByRole('link', { name: 'Transactions' }).getAttribute('href'),
      ).toBe('/accounting/main');

      fireEvent.click(header.getByRole('link', { name: 'Back' }));

      expect(await screen.findByText('Transactions list')).toBeTruthy();
      expect(screen.getByLabelText('list filters').textContent).toBe('');
    },
  );

  it.each(sidebarHrefs())(
    'opens a real screen from sidebar link %s',
    async (href) => {
      renderAccountingAt(href ?? '');

      expect(await screen.findByRole('heading', { level: 2 })).toBeTruthy();
      expect(screen.queryByText('Oops! Page not found.')).toBeNull();
    },
  );
});
