import { act, fireEvent, render, screen } from '@testing-library/react';
import { UseFormReturn } from 'react-hook-form';
import { FIXED_ASSET_PANEL } from '@/settings/fixed-assets/components/FixedAssetPanel';
import { TFixedAssetForm } from '@/settings/fixed-assets/types/FixedAsset';

const mockEdit = jest.fn();
const mockToast = jest.fn();
const mockClosePanel = jest.fn();
let mockDetail: Record<string, unknown> | undefined;

const withoutEmpty = (value: Record<string, unknown>) =>
  JSON.stringify(
    Object.keys(value)
      .sort()
      .filter((key) => value[key] !== undefined)
      .map((key) => [key, value[key]]),
  );

jest.mock('react-i18next', () => {
  const t = (key: string) => key;

  return { useTranslation: () => ({ t }) };
});
jest.mock('erxes-ui', () => ({
  Form: () => null,
  ScrollArea: () => null,
  Spinner: () => <span>loading</span>,
  isDeeplyEqual: (
    first: Record<string, unknown>,
    second: Record<string, unknown>,
  ) => withoutEmpty(first) === withoutEmpty(second),
  toast: (props: unknown) => mockToast(props),
}));
jest.mock('ui-modules', () => ({
  ActivityLogs: () => null,
  PanelFormLayout: () => null,
}));
jest.mock('@/settings/fixed-assets/components/FixedAssetForm', () => ({
  FixedAssetForm: ({
    form,
    handleSubmit,
  }: {
    form: UseFormReturn<TFixedAssetForm>;
    handleSubmit: (data: TFixedAssetForm) => void;
  }) => (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      <input aria-label="name" {...form.register('name')} />
      <button type="submit">save</button>
    </form>
  ),
}));
jest.mock('@/settings/fixed-assets/hooks/useFixedAssetDetail', () => ({
  useFixedAssetDetail: () => ({ fixedAssetDetail: mockDetail, loading: false }),
}));
jest.mock('@/settings/fixed-assets/hooks/useFixedAssetMutations', () => ({
  useFixedAssetAdd: () => ({ addFixedAsset: jest.fn(), loading: false }),
  useFixedAssetEdit: () => ({ editFixedAsset: mockEdit, loading: false }),
}));
jest.mock('@/settings/hooks/useSettingsPanel', () => ({
  useSettingsPanel: () => ({
    cancelDraft: jest.fn(),
    closePanel: mockClosePanel,
  }),
}));

const SAVED_ASSET = {
  _id: 'laptop',
  code: 'LT-7',
  name: 'Laptop',
  categoryId: 'computers',
  annualDepreciationRate: 25,
};

const openSavedAsset = async () => {
  const { Detail } = FIXED_ASSET_PANEL;

  await act(async () => {
    render(<Detail contentType="" contentId="laptop" />);
  });
};

const save = () =>
  act(async () => {
    fireEvent.click(screen.getByRole('button', { name: 'save' }));
  });

beforeEach(() => {
  jest.clearAllMocks();
  mockDetail = SAVED_ASSET;
});

test('renaming a saved asset sends the change and closes after saving', async () => {
  mockEdit.mockImplementation(({ onCompleted }) => onCompleted());
  await openSavedAsset();

  expect((screen.getByLabelText('name') as HTMLInputElement).value).toBe(
    'Laptop',
  );

  fireEvent.change(screen.getByLabelText('name'), {
    target: { value: 'Work laptop' },
  });
  await save();

  expect(mockEdit.mock.calls[0][0].variables).toMatchObject({
    _id: 'laptop',
    code: 'LT-7',
    name: 'Work laptop',
    usefulLife: 4,
  });
  expect(mockClosePanel).toHaveBeenCalledTimes(1);
});

test('saving without changes closes the panel and sends nothing', async () => {
  await openSavedAsset();

  await save();

  expect(mockEdit).not.toHaveBeenCalled();
  expect(mockClosePanel).toHaveBeenCalledTimes(1);
});

test('an asset that fails validation warns instead of filling the form', async () => {
  mockDetail = { ...SAVED_ASSET, depreciationMethod: 'unknown-method' };

  await openSavedAsset();

  expect(mockToast).toHaveBeenCalledTimes(1);
  expect(mockToast.mock.calls[0][0].variant).toBe('destructive');
  expect((screen.getByLabelText('name') as HTMLInputElement).value).toBe('');
});
