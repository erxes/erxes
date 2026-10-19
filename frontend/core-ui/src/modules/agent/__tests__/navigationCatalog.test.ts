import {
  buildNavigationCatalog,
  isKnownCatalogPage,
  NAVIGATION_CATALOG_MAX_ENTRIES,
} from '../utils/navigationCatalog';
import type { INavigationActivity } from '@/navigation/types/NavigationActivity';

const activity = (over: Partial<INavigationActivity>): INavigationActivity => ({
  id: 'x',
  label: 'Sales',
  kind: 'plugin',
  defaultPath: 'sales',
  modules: [],
  ...over,
});

describe('buildNavigationCatalog', () => {
  it('emits the group entry plus every module and submenu', () => {
    const catalog = buildNavigationCatalog({
      activities: [
        activity({
          label: 'Sales',
          defaultPath: '/sales',
          modules: [
            {
              name: 'Deals',
              path: '/sales/deals',
              submenus: [{ name: 'Pipelines', path: '/sales/pipelines' }],
            },
          ],
        }),
      ],
    });

    expect(catalog).toEqual([
      { path: '/sales', label: 'Sales', group: 'Sales' },
      { path: '/sales/deals', label: 'Deals', group: 'Sales' },
      {
        path: '/sales/pipelines',
        label: 'Pipelines',
        group: 'Sales · Deals',
      },
    ]);
  });

  it('normalises paths to a leading slash', () => {
    const catalog = buildNavigationCatalog({
      activities: [activity({ defaultPath: 'sales/deals' })],
    });
    expect(catalog[0].path).toBe('/sales/deals');
  });

  it('dedupes by path, first entry wins', () => {
    const catalog = buildNavigationCatalog({
      activities: [
        activity({
          defaultPath: '/sales',
          modules: [
            { name: 'Deals', path: '/sales/deals' },
            { name: 'Deals again', path: 'sales/deals' },
          ],
        }),
      ],
      fixed: [{ path: '/sales/deals', label: 'Late dup' }],
    });
    expect(catalog).toHaveLength(2);
    expect(catalog[1].label).toBe('Deals');
  });

  it('includes settings groups and sub-navigation items', () => {
    const catalog = buildNavigationCatalog({
      activities: [],
      settingsGroups: [
        [{ name: 'Brands', path: '/settings/brands' }],
        [{ name: 'Profile', path: '/settings/profile' }],
      ],
      settingsSubNavigation: {
        '/settings/agent': {
          name: 'Agents',
          items: [
            { name: 'Appearance', path: '/settings/agent/appearance' },
            { name: 'Approvals', path: '/settings/agent/approvals' },
          ],
        },
      },
    });

    expect(catalog).toContainEqual({
      path: '/settings/brands',
      label: 'Brands',
      group: 'Settings',
    });
    expect(catalog).toContainEqual({
      path: '/settings/agent/appearance',
      label: 'Appearance',
      group: 'Settings · Agents',
    });
  });

  it('includes fixed core pages', () => {
    const catalog = buildNavigationCatalog({
      activities: [],
      fixed: [{ path: '/my-inbox', label: 'My inbox' }],
    });
    expect(catalog).toContainEqual({
      path: '/my-inbox',
      label: 'My inbox',
    });
  });

  it('caps the catalog at 400 entries', () => {
    const catalog = buildNavigationCatalog({
      activities: [
        activity({
          modules: Array.from({ length: 500 }, (_, i) => ({
            name: `m${i}`,
            path: `/m${i}`,
          })),
        }),
      ],
    });
    expect(catalog).toHaveLength(NAVIGATION_CATALOG_MAX_ENTRIES);
  });

  it('drops entries with unusable paths or labels', () => {
    const catalog = buildNavigationCatalog({
      activities: [
        activity({
          modules: [
            { name: '', path: '/no-label' },
            { name: 'no path', path: '' },
          ],
        }),
      ],
    });
    expect(catalog).toEqual([
      { path: '/sales', label: 'Sales', group: 'Sales' },
    ]);
  });
});

describe('isKnownCatalogPage', () => {
  const catalog = [
    { path: '/sales/deals', label: 'Deals' },
    { path: '/settings/agent/appearance', label: 'Appearance' },
    { path: '/settings/emails?view=addresses', label: 'Addresses' },
  ];

  it('accepts an exact catalog path', () => {
    expect(isKnownCatalogPage(catalog, '/sales/deals')).toBe(true);
  });

  it('accepts a nested sub-path of a catalog page', () => {
    expect(isKnownCatalogPage(catalog, '/sales/deals/abc123')).toBe(true);
  });

  it('compares pathnames, ignoring query strings on both sides', () => {
    expect(isKnownCatalogPage(catalog, '/settings/emails?view=limits')).toBe(
      true,
    );
  });

  it('rejects an unknown or invented path', () => {
    expect(isKnownCatalogPage(catalog, '/sales/calendar')).toBe(false);
    expect(isKnownCatalogPage(catalog, 'https://evil.example')).toBe(false);
  });
});
