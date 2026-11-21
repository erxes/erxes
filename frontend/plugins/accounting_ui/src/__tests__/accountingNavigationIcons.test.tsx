import type { ElementType, ReactNode } from 'react';
import { render } from '@testing-library/react';
import { CONFIG } from '~/config';
import { MainNavigation } from '@/MainNavigation';
import { AdjustmentNavigation } from '@/AdjustmentNavigation';
import { InventoriesNavigation } from '@/InventoriesNavigation';
import { FixedAssetsNavigation } from '@/fixedAssets/FixedAssetsNavigation';
import { SettingsNavigation } from '@/SettingsNavigation';

type TSidebarEntry = { path: string; icon: ElementType; section: boolean };

const mockSidebarEntries: TSidebarEntry[] = [];

const mockTrim = (path: string) => path.replace(/^\//, '');

// Status links filter the Transactions list and add no sidebar page.
jest.mock('@/transactions/components/TransactionStatusNavigation', () => ({
  TransactionStatusNavigation: () => null,
}));

jest.mock('@/NavigationSection', () => ({
  NavigationSection: ({
    icon,
    sectionPath,
    items,
  }: {
    icon: ElementType;
    sectionPath: string;
    items: { icon: ElementType; path: string }[];
  }) => {
    mockSidebarEntries.push({
      path: mockTrim(sectionPath),
      icon,
      section: true,
    });
    for (const item of items) {
      mockSidebarEntries.push({
        path: mockTrim(item.path),
        icon: item.icon,
        section: false,
      });
    }
    return null;
  },
}));
jest.mock(
  'erxes-ui',
  () => {
    const Passthrough = ({ children }: { children: ReactNode }) => (
      <div>{children}</div>
    );
    return {
      NavigationMenuLinkItem: ({
        icon,
        path,
        pathPrefix,
      }: {
        icon: ElementType;
        path: string;
        pathPrefix: string;
      }) => {
        mockSidebarEntries.push({
          path: `${pathPrefix}/${path}`,
          icon,
          section: false,
        });
        return null;
      },
      Sidebar: Object.assign(Passthrough, {
        Group: Passthrough,
        GroupContent: Passthrough,
        Menu: Passthrough,
      }),
      sidebarPanelOpenState: {},
    };
  },
  { virtual: true },
);
jest.mock('jotai', () => ({ useSetAtom: () => jest.fn() }));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('~/searchProviders', () => ({ SEARCH_PROVIDERS: [] }));

const sidebarIconFor = (path: string) => {
  const matches = mockSidebarEntries.filter((entry) => entry.path === path);
  return (matches.find((entry) => !entry.section) ?? matches[0])?.icon;
};

describe('accounting navigation icons', () => {
  beforeAll(() => {
    render(
      <>
        <MainNavigation />
        <AdjustmentNavigation />
        <InventoriesNavigation />
        <FixedAssetsNavigation />
        <SettingsNavigation />
      </>,
    );
  });

  test('every page reachable from the sidebar keeps the same icon in the app menu and favourites', () => {
    const sidebarModules = (CONFIG.modules ?? []).filter((module) =>
      sidebarIconFor(module.path),
    );

    expect(sidebarModules.length).toBeGreaterThan(15);
    expect(
      sidebarModules
        .filter((module) => module.icon !== sidebarIconFor(module.path))
        .map((module) => module.name),
    ).toEqual([]);
  });
});
