import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fireEvent, render, screen } from '@testing-library/react';
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
jest.mock('~/pages/TransactionListPage', () => ({
  TransactionListPage: () => <h2>Transactions list</h2>,
}));
jest.mock('~/pages/TrRecordListPage', () => ({
  TrRecordListPage: () => <h2>Journal entries list</h2>,
}));
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

  it.each(sidebarHrefs())(
    'opens a real screen from sidebar link %s',
    async (href) => {
      renderAccountingAt(href ?? '');

      expect(await screen.findByRole('heading', { level: 2 })).toBeTruthy();
      expect(screen.queryByText('Oops! Page not found.')).toBeNull();
    },
  );
});
