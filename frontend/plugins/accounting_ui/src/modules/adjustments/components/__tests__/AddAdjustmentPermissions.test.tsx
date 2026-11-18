import type { ReactNode } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { AddAdjustFundRate } from '@/adjustments/rate/components/AdjustFundRateForm';
import { AddAdjustDebtRate } from '@/adjustments/debt/components/AdjustDebtRateForm';
import { AddAdjustInventory } from '@/adjustments/inventories/components/AdjustInventoryForm';
import { AddAdjustFixedAsset } from '@/adjustments/fxa/components/AdjustFixedAssetForm';
import { AddAdjustClosing } from '@/adjustments/closing/components/AddAdjustClosing';

const mockGranted = new Set<string>();
const mockOpenDraft = jest.fn();

jest.mock('react-router', () => {
  const { TextDecoder, TextEncoder } =
    jest.requireActual<typeof import('util')>('util');
  Object.assign(globalThis, { TextDecoder, TextEncoder });
  return jest.requireActual('react-router');
});
jest.mock(
  'erxes-ui',
  () => ({
    Button: ({
      children,
      onClick,
    }: {
      children: ReactNode;
      onClick: () => void;
    }) => (
      <button type="button" onClick={onClick}>
        {children}
      </button>
    ),
    CurrencyCode: { MNT: 'MNT' },
  }),
  { virtual: true },
);
jest.mock('ui-modules', () => ({
  Can: ({ action, children }: { action: string; children: ReactNode }) =>
    mockGranted.has(action) ? children : null,
  useSidePanel: () => ({ close: jest.fn() }),
}));
jest.mock('@/settings/hooks/useSettingsPanel', () => ({
  useSettingsPanel: (contentType: string) => ({
    openDraft: () => mockOpenDraft(contentType),
  }),
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const adjustments = [
  {
    name: 'fund rate',
    Add: AddAdjustFundRate,
    label: 'Add Fund Rate Adjustment',
    permission: 'manageAdjustFundRates',
  },
  {
    name: 'debt rate',
    Add: AddAdjustDebtRate,
    label: 'Add Debt Rate Adjustment',
    permission: 'manageAdjustDebtRates',
  },
  {
    name: 'inventory costing',
    Add: AddAdjustInventory,
    label: 'add-inventory-adjustment',
    permission: 'manageAdjustInventories',
  },
  {
    name: 'fixed asset',
    Add: AddAdjustFixedAsset,
    label: 'add-fixed-asset-adjustment',
    permission: 'manageAdjustFixedAssets',
  },
  {
    name: 'closing',
    Add: AddAdjustClosing,
    label: 'Add Closing Adjustment',
    permission: 'manageAdjustClosings',
  },
];

beforeEach(() => {
  mockGranted.clear();
  mockOpenDraft.mockClear();
});

describe.each(adjustments)(
  'adding a $name adjustment',
  ({ Add, label, permission }) => {
    test('a viewer without the manage permission is not offered the add button', () => {
      mockGranted.add(permission.replace('manage', 'read'));
      render(<Add />);
      expect(screen.queryByRole('button', { name: label })).toBeNull();
    });

    test('a manager of another adjustment type still cannot add this one', () => {
      for (const other of adjustments) {
        if (other.permission !== permission) mockGranted.add(other.permission);
      }
      render(<Add />);
      expect(screen.queryByRole('button', { name: label })).toBeNull();
    });

    test('a manager opens a new draft from the add button', () => {
      mockGranted.add(permission);
      render(<Add />);
      fireEvent.click(screen.getByRole('button', { name: label }));
      expect(mockOpenDraft).toHaveBeenCalledTimes(1);
    });
  },
);
