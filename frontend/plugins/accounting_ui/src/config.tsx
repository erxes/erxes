import { IconCashBanknote, IconReceipt } from '@tabler/icons-react';
import { IUIConfig, TFavoritePathProps } from 'erxes-ui';
import { lazy, Suspense } from 'react';
import {
  TR_JOURNAL_LABELS,
  TrJournalEnum,
} from './modules/transactions/types/constants';
import { ACC_TR_CHECK_ROUTES } from './modules/check-synced/constants/settingsRoutes';

const MainNavigation = lazy(() =>
  import('./modules/MainNavigation').then((module) => ({
    default: module.MainNavigation,
  })),
);

const AdjustmentNavigation = lazy(() =>
  import('./modules/AdjustmentNavigation').then((mod) => ({
    default: mod.AdjustmentNavigation,
  })),
);

const InventoriesNavigation = lazy(() =>
  import('./modules/InventoriesNavigation').then((mod) => ({
    default: mod.InventoriesNavigation,
  })),
);

const SettingsNavigation = lazy(() =>
  import('./modules/SettingsNavigation').then((module) => ({
    default: module.SettingsNavigation,
  })),
);

const getAccountingJournalName = (journal: string | null) => {
  if (!journal) return undefined;

  return Object.values(TrJournalEnum).includes(journal as TrJournalEnum)
    ? TR_JOURNAL_LABELS[journal as TrJournalEnum]
    : undefined;
};

const getAccountingFavoritePath = ({
  pathname,
  search,
}: TFavoritePathProps) => {
  if (!pathname.endsWith('/accounting/records')) return pathname;

  const journal = new URLSearchParams(search).get('journal');

  return journal ? `${pathname}?journal=${journal}` : pathname;
};

const getAccountingFavoriteName = (path: string) => {
  const pathWithoutQuery = path.split('?')[0].replace(/^\/|\/$/g, '');

  if (pathWithoutQuery === 'accounting') return 'Санхүү';
  if (pathWithoutQuery === 'accounting/main') return 'Баримтууд';
  if (pathWithoutQuery === 'accounting/records') {
    const journal = new URLSearchParams(path.split('?')[1] || '').get(
      'journal',
    );

    return getAccountingJournalName(journal) || 'Журнал бичилт';
  }

  if (pathWithoutQuery.includes('/transaction/create')) {
    return 'Гүйлгээ үүсгэх';
  }

  if (pathWithoutQuery.includes('/transaction/edit')) {
    return 'Гүйлгээ засах';
  }

  if (pathWithoutQuery.includes('/transaction/print')) {
    return 'Гүйлгээ хэвлэх';
  }

  if (pathWithoutQuery === 'accounting/journal-reports') {
    return 'Тайлан';
  }

  if (pathWithoutQuery.includes('/gen-journal-report')) {
    return 'Тайлан';
  }

  if (pathWithoutQuery === 'accounting/check-sync') return 'Мэдээ таталт';

  const checkSyncLabel =
    ACC_TR_CHECK_ROUTES[
      `/${pathWithoutQuery}` as keyof typeof ACC_TR_CHECK_ROUTES
    ];

  if (checkSyncLabel) return checkSyncLabel;

  if (pathWithoutQuery === 'accounting/adjustment') return 'Adjustments';
  if (pathWithoutQuery.includes('/adjustment/inventory/detail')) {
    return 'Inventory Adjustment Detail';
  }

  if (pathWithoutQuery.endsWith('/adjustment/inventory')) {
    return 'Adjustment / Inventory';
  }

  if (pathWithoutQuery.endsWith('/adjustment/fundRate')) {
    return 'Adjustment / Fund Rate';
  }

  if (pathWithoutQuery.endsWith('/adjustment/debRate')) {
    return 'Adjustment / Debt Rate';
  }

  if (pathWithoutQuery.endsWith('/adjustment/fxa')) return 'Adjustment / FXA';
  if (pathWithoutQuery.endsWith('/adjustment/closing')) {
    return 'Adjustment / Closing';
  }

  if (pathWithoutQuery.endsWith('/inventories/remainders')) {
    return 'Үлдэгдэл';
  }

  if (pathWithoutQuery.endsWith('/inventories/safe-remainders')) {
    return 'Тооллого';
  }

  if (pathWithoutQuery.includes('/inventories/safe-remainder/detail')) {
    return 'Тооллого';
  }

  if (pathWithoutQuery.endsWith('/inventories/reserve-remainders')) {
    return 'Нөөц үлдэгдэл';
  }

  return 'Accounting';
};

export const CONFIG: IUIConfig = {
  name: 'accounting',
  path: 'accounting',
  settingsNavigation: () => (
    <Suspense fallback={<div />}>
      <SettingsNavigation />
    </Suspense>
  ),
  navigationGroup: {
    name: 'accounting',
    icon: IconCashBanknote,
    content: () => (
      <Suspense fallback={<div />}>
        <MainNavigation />
      </Suspense>
    ),
    subGroup: () => (
      <Suspense fallback={<div />}>
        <AdjustmentNavigation />
        <InventoriesNavigation />
      </Suspense>
    ),
  },
  modules: [
    {
      name: 'accounting',
      icon: IconCashBanknote,
      path: 'accounting',
      favoriteName: getAccountingFavoriteName,
      favoritePath: getAccountingFavoritePath,
    },
  ],
  widgets: {
    relationWidgets: [
      {
        name: 'transactions',
        icon: IconReceipt,
      },
    ],
  },
};
