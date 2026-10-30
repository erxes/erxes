import { act, fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { FixedAssetForm } from '@/settings/fixed-assets/components/FixedAssetForm';
import { FIXED_ASSET_DEFAULT_VALUES } from '@/settings/fixed-assets/constants/defaultValues';
import { fixedAssetSchema } from '@/settings/fixed-assets/constants/schema';
import { TFixedAssetForm } from '@/settings/fixed-assets/types/FixedAsset';

const mockToast = jest.fn();

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('erxes-ui', () => {
  const { Controller, FormProvider } = jest.requireActual('react-hook-form');
  return {
    Form: Object.assign(FormProvider, { Field: Controller }),
    Input: 'input',
    Spinner: () => null,
    ScrollArea: () => null,
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
}));
jest.mock('@/settings/components/panel/SettingsPanelFields', () => ({
  SettingsPanelSelect: ({ placeholder }: { placeholder: string }) => (
    <output aria-label={placeholder} />
  ),
  SettingsPanelDescriptionInput: () => null,
}));
jest.mock(
  '@/settings/fixed-assets/components/SelectFixedAssetCategory',
  () => ({
    SelectFixedAssetCategory: ({
      onSelect,
    }: {
      onSelect: (categoryId: string) => void;
    }) => (
      <button type="button" onClick={() => onSelect('computers')}>
        pick
      </button>
    ),
  }),
);
jest.mock('@/settings/fixed-assets/hooks/useFixedAssetCategories', () => ({
  useFixedAssetCategories: () => ({
    fixedAssetCategories: [
      {
        _id: 'computers',
        depreciationMethod: 'straightLine',
        defaultAnnualDepreciationRate: 25,
        defaultSalvageValue: 100,
      },
    ],
  }),
}));

const renderForm = (
  onSubmit: (data: TFixedAssetForm) => void,
  defaultValues: Partial<TFixedAssetForm> = {},
) => {
  const Harness = () => {
    const form = useForm<TFixedAssetForm>({
      resolver: zodResolver(fixedAssetSchema),
      defaultValues: { ...FIXED_ASSET_DEFAULT_VALUES, ...defaultValues },
    });

    return (
      <FixedAssetForm
        form={form}
        handleSubmit={onSubmit}
        onCancel={jest.fn()}
        loading={false}
      />
    );
  };

  render(<Harness />);
};

const save = () =>
  act(async () => {
    fireEvent.click(screen.getByRole('button', { name: 'save' }));
  });

beforeEach(() => mockToast.mockClear());

test('picking a category fills depreciation defaults and they are saved', async () => {
  const onSubmit = jest.fn();
  renderForm(onSubmit, { code: 'LT-7', name: 'Laptop' });

  fireEvent.click(screen.getByText('pick'));

  expect(
    (screen.getByLabelText('useful-life-in-years') as HTMLInputElement).value,
  ).toBe('4');

  await save();

  expect(onSubmit.mock.calls[0][0]).toMatchObject({
    categoryId: 'computers',
    annualDepreciationRate: 25,
    usefulLife: 4,
    salvageValue: 100,
  });
});

test('typing useful life updates the annual rate', () => {
  renderForm(jest.fn());

  fireEvent.change(screen.getByLabelText('useful-life-in-years'), {
    target: { value: '8' },
  });

  expect(
    (screen.getByLabelText('annual-depreciation-rate') as HTMLInputElement)
      .value,
  ).toBe('12.5');
});

test('an asset without code, name or category warns and is not saved', async () => {
  const onSubmit = jest.fn();
  renderForm(onSubmit);

  await save();

  expect(onSubmit).not.toHaveBeenCalled();
  expect(screen.getAllByRole('alert')).toHaveLength(3);
  expect(mockToast).toHaveBeenCalledTimes(1);
  expect(mockToast.mock.calls[0][0].title).toBe(
    'required-information-is-missing',
  );
});
