import { act, fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { FXA_OWNER_RECORD_PANELS } from '@/fixedAssets/ownerRecords/components/FxaOwnerRecordPanel';
import { FXA_OWNER_RECORD_CONTENT_TYPES } from '@/fixedAssets/ownerRecords/constants/ownerRecordPanel';

const mockAdd = jest.fn();
const mockTransfer = jest.fn();
const mockToast = jest.fn();
const mockClosePanel = jest.fn();
let mockDraft: Record<string, unknown> = {};

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  getI18n: () => ({ t: (key: string) => key }),
}));
jest.mock('erxes-ui', () => {
  const { Controller, FormProvider } = jest.requireActual('react-hook-form');
  return {
    Form: Object.assign(FormProvider, { Field: Controller }),
    Input: 'input',
    InputNumber: ({
      value,
      onChange,
    }: {
      value?: number;
      onChange: (value?: number) => void;
    }) => (
      <input
        aria-label="count"
        value={value ?? ''}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    ),
    toast: (props: unknown) => mockToast(props),
  };
});
jest.mock('ui-modules', () => ({
  PANEL_INPUT_CLASS_NAME: '',
  PanelFormRow: ({
    label,
    error,
    children,
  }: {
    label: string;
    error?: string;
    children: ReactNode;
  }) => (
    <label>
      {label}
      {children}
      {error && <span role="alert">{error}</span>}
    </label>
  ),
  PanelFormLayout: ({ children }: { children: ReactNode }) => (
    <>
      {children}
      <button type="submit">save</button>
    </>
  ),
  ActivityLogs: () => null,
  SelectMember: {
    InlineCell: ({
      value,
      scope,
      onValueChange,
    }: {
      value: string;
      scope: string;
      onValueChange: (value: string) => void;
    }) => (
      <input
        aria-label={scope}
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
      />
    ),
  },
  useSidePanelDraft: () => mockDraft,
}));
jest.mock('@/settings/fixed-assets/components/SelectFixedAsset', () => ({
  SelectFixedAsset: {
    InlineCell: ({ value }: { value: string }) => (
      <output aria-label="fixed-asset">{value}</output>
    ),
  },
}));
jest.mock('@/settings/fixed-assets/hooks/useFixedAssetMutations', () => ({
  useFixedAssetOwnerRecordAdd: () => ({
    addFixedAssetOwnerRecord: mockAdd,
    loading: false,
  }),
  useFixedAssetOwnerRecordTransfer: () => ({
    transferFixedAssetOwnerRecord: mockTransfer,
    loading: false,
  }),
}));
jest.mock('@/settings/hooks/useSettingsPanel', () => ({
  useSettingsPanel: () => ({
    cancelDraft: jest.fn(),
    closePanel: mockClosePanel,
  }),
}));

const openTransferPanel = () => {
  const { New } =
    FXA_OWNER_RECORD_PANELS[FXA_OWNER_RECORD_CONTENT_TYPES.transfer];

  return render(<New contentType="" contentId="new" />);
};

const save = () =>
  act(async () => {
    fireEvent.click(screen.getByRole('button', { name: 'save' }));
  });

beforeEach(() => {
  jest.clearAllMocks();
  mockDraft = {
    fixedAssetId: 'laptop',
    code: 'LT-7',
    count: 2,
    fromOwnerId: 'bold',
  };
});

test('transferring a row keeps its asset and current custodian and closes after saving', async () => {
  mockTransfer.mockImplementation(({ onCompleted }) => onCompleted());
  openTransferPanel();

  expect(screen.getByLabelText('fixed-asset').textContent).toBe('laptop');
  expect(
    (screen.getByLabelText('fxaOwnerRecord.fromOwner') as HTMLInputElement)
      .value,
  ).toBe('bold');

  fireEvent.change(screen.getByLabelText('fxaOwnerRecord.toOwner'), {
    target: { value: 'saraa' },
  });
  await save();

  expect(mockTransfer.mock.calls[0][0].variables).toEqual({
    fixedAssetId: 'laptop',
    code: 'LT-7',
    sequence: undefined,
    count: 2,
    fromOwnerId: 'bold',
    toOwnerId: 'saraa',
  });
  expect(mockClosePanel).toHaveBeenCalledTimes(1);
});

test('transferring to the same custodian warns and saves nothing', async () => {
  openTransferPanel();

  fireEvent.change(screen.getByLabelText('fxaOwnerRecord.toOwner'), {
    target: { value: 'bold' },
  });
  await save();

  expect(mockTransfer).not.toHaveBeenCalled();
  expect(mockClosePanel).not.toHaveBeenCalled();
  expect(screen.getByRole('alert').textContent).toBe(
    'the-source-and-receiving-custodians-must-be-different',
  );
  expect(mockToast).toHaveBeenCalledTimes(1);
});

test('opening another row while the panel stays open shows that row', () => {
  const { rerender } = openTransferPanel();
  const { New } =
    FXA_OWNER_RECORD_PANELS[FXA_OWNER_RECORD_CONTENT_TYPES.transfer];

  mockDraft = { fixedAssetId: 'printer', count: 1, fromOwnerId: 'saraa' };
  rerender(<New contentType="" contentId="new" />);

  expect(screen.getByLabelText('fixed-asset').textContent).toBe('printer');
});

const openOwnerPanel = (mode: 'receive' | 'handOver') => {
  const { New } = FXA_OWNER_RECORD_PANELS[FXA_OWNER_RECORD_CONTENT_TYPES[mode]];

  return render(<New contentType="" contentId="new" />);
};

test('assigning custody with an asset and custodian saves a received record', async () => {
  mockAdd.mockImplementation(({ onCompleted }) => onCompleted());
  mockDraft = { fixedAssetId: 'laptop', code: 'FA-001' };
  openOwnerPanel('receive');

  fireEvent.change(screen.getByLabelText('fxaOwnerRecord.owner'), {
    target: { value: 'bupka' },
  });
  await save();

  expect(mockToast).not.toHaveBeenCalled();
  expect(mockAdd.mock.calls[0][0].variables).toMatchObject({
    fixedAssetId: 'laptop',
    code: 'FA-001',
    count: 1,
    action: 'received',
    status: 'active',
    ownerId: 'bupka',
  });
  expect(mockClosePanel).toHaveBeenCalledTimes(1);
});

test('removing custody with an asset and custodian saves a handed over record', async () => {
  mockDraft = { fixedAssetId: 'laptop', ownerId: 'bupka', count: 2 };
  openOwnerPanel('handOver');

  await save();

  expect(mockAdd.mock.calls[0][0].variables).toMatchObject({
    fixedAssetId: 'laptop',
    count: 2,
    action: 'handedOver',
    ownerId: 'bupka',
  });
});

test('assigning custody without a custodian warns and saves nothing', async () => {
  mockDraft = { fixedAssetId: 'laptop' };
  openOwnerPanel('receive');

  await save();

  expect(mockAdd).not.toHaveBeenCalled();
  expect(screen.getByRole('alert').textContent).toBe(
    'select-an-asset-custodian',
  );
  expect(mockToast).toHaveBeenCalledTimes(1);
});

test('transferring without a receiving custodian warns and saves nothing', async () => {
  openTransferPanel();

  await save();

  expect(mockTransfer).not.toHaveBeenCalled();
  expect(screen.getByRole('alert').textContent).toBe(
    'select-the-receiving-custodian',
  );
});

test('transferring with no custodians picked warns and saves nothing', async () => {
  mockDraft = { fixedAssetId: 'laptop' };
  openTransferPanel();

  await save();

  expect(mockTransfer).not.toHaveBeenCalled();
  expect(screen.getByRole('alert').textContent).toBe(
    'select-the-receiving-custodian',
  );
  expect(mockToast).toHaveBeenCalledTimes(1);
});
