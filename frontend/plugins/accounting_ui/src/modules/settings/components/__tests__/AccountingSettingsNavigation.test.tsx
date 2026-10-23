import { render, screen } from '@testing-library/react';
import { useLocation } from 'react-router';
import { SettingsNavigation } from '../../../SettingsNavigation';
import { AccountingTopbar } from '../AccountingTopbar';
import { INVENTORY_SETTINGS_ROUTES } from '../../constants/settingsRoutes';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('react-router', () => ({ useLocation: jest.fn() }));
jest.mock('erxes-ui', () => ({
  Sidebar: { Group: 'div', GroupContent: 'div', Menu: 'nav' },
  NavigationMenuLinkItem: ({
    name,
    path,
    pathPrefix,
  }: {
    name: string;
    path: string;
    pathPrefix: string;
  }) => <a href={`/${pathPrefix}${path}`}>{name}</a>,
}));
jest.mock('ui-modules', () => ({ Can: () => null, Import: () => null }));
jest.mock('@/settings/account/components/AddAccount', () => ({
  AddAccount: () => null,
}));
jest.mock(
  '@/settings/account/account-categories/components/AddAccountCategory',
  () => ({ AddAccountCategory: () => null }),
);
jest.mock('@/settings/fixed-assets/components/AddFixedAssetCategory', () => ({
  AddFixedAssetCategory: () => null,
}));
jest.mock(
  '@/settings/fixed-assets/account-config/components/FixedAssetAccountConfigsTable',
  () => ({ AddFixedAssetAccountConfig: () => null }),
);
jest.mock('@/settings/vat/components/AddVats', () => ({ AddVats: () => null }));
jest.mock('@/settings/ctax/components/AddCtaxs', () => ({
  AddCtaxs: () => null,
}));
jest.mock('@/settings/jobs/components/AddJob', () => ({
  AddJob: () => <button>Add technology card</button>,
}));
jest.mock('../../syncSettings/AddAccountingConfig', () => ({
  AddAccountingConfig: ({ code }: { code: string }) => <button>{code}</button>,
}));

test('settings links use the plugin-owned prefix and retain inventory', () => {
  render(<SettingsNavigation />);
  expect(
    screen.getByRole('link', { name: 'accounting' }).getAttribute('href'),
  ).toBe('/accounting/settings/config');
  expect(
    screen.getByRole('link', { name: 'fixed-asset' }).getAttribute('href'),
  ).toBe('/accounting/settings/fixed-assets');
  expect(
    screen.getByRole('link', { name: 'inventory' }).getAttribute('href'),
  ).toBe('/accounting/settings/inventories');
});

test.each(Object.keys(INVENTORY_SETTINGS_ROUTES))(
  'retains the add-card action on %s',
  (pathname) => {
    jest.mocked(useLocation).mockReturnValue({
      pathname,
      search: '',
      hash: '',
      state: null,
      key: 'test',
    });
    render(<AccountingTopbar />);
    expect(
      screen.getByRole('button', { name: 'Add technology card' }),
    ).toBeTruthy();
  },
);

test('retains the sync-deal action at the new settings location', () => {
  jest.mocked(useLocation).mockReturnValue({
    pathname: '/accounting/settings/config/sync-deal',
    search: '',
    hash: '',
    state: null,
    key: 'test',
  });
  render(<AccountingTopbar />);
  expect(screen.getByRole('button', { name: 'syncDeal' })).toBeTruthy();
});
