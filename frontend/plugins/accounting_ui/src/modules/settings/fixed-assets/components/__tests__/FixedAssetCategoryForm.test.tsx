import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FIXED_ASSET_CATEGORY_DEFAULT_VALUES } from '@/settings/fixed-assets/constants/defaultValues';
import { fixedAssetCategorySchema } from '@/settings/fixed-assets/constants/schema';
import type { TFixedAssetCategoryForm } from '@/settings/fixed-assets/types/FixedAsset';
import { FixedAssetCategoryForm } from '@/settings/fixed-assets/components/FixedAssetCategoryForm';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('erxes-ui', () => {
  const { Controller, FormProvider } = jest.requireActual('react-hook-form');
  return {
    Form: Object.assign(FormProvider, { Field: Controller }),
    Input: 'input',
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
  PanelFormLayout: ({
    children,
    saveLabel,
  }: {
    children: ReactNode;
    saveLabel?: string;
  }) => (
    <>
      {children}
      <button type="submit">{saveLabel}</button>
    </>
  ),
  ActivityLogs: () => null,
}));
jest.mock(
  '@/settings/fixed-assets/components/SelectFixedAssetCategory',
  () => ({
    SelectFixedAssetCategory: () => null,
  }),
);
jest.mock('@/settings/components/panel/SettingsPanelFields', () => ({
  ...jest.requireActual('@/settings/components/panel/SettingsPanelFields'),
  SettingsPanelSelect: () => null,
  SettingsPanelDescriptionInput: () => null,
}));

const renderForm = (onSubmit: (data: TFixedAssetCategoryForm) => void) => {
  const Harness = () => {
    const form = useForm<TFixedAssetCategoryForm>({
      resolver: zodResolver(fixedAssetCategorySchema),
      defaultValues: FIXED_ASSET_CATEGORY_DEFAULT_VALUES,
    });

    return (
      <FixedAssetCategoryForm
        form={form}
        onSubmit={onSubmit}
        onCancel={jest.fn()}
        saving={false}
      />
    );
  };

  render(<Harness />);
};

const field = (label: string) =>
  screen.getByLabelText(label, { selector: 'input' });

test('an accountant typing a 5 year useful life gets a 20% annual rate and can save the category', async () => {
  const onSubmit = jest.fn();
  renderForm(onSubmit);

  fireEvent.change(field('code'), { target: { value: 'FA-01' } });
  fireEvent.change(field('name'), { target: { value: 'Computers' } });
  fireEvent.change(field('useful-life-in-years'), { target: { value: '5' } });
  expect(field('annual-depreciation-rate')).toHaveProperty('value', '20');

  fireEvent.change(field('annual-tax-depreciation-rate'), {
    target: { value: '12.5' },
  });
  expect(field('tax-useful-life-in-years')).toHaveProperty('value', '8');

  fireEvent.click(screen.getByRole('button', { name: 'save-category' }));

  await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
  expect(onSubmit.mock.calls[0][0]).toMatchObject({
    code: 'FA-01',
    name: 'Computers',
    defaultUsefulLife: 5,
    defaultAnnualDepreciationRate: 20,
    defaultTaxUsefulLife: 8,
    defaultTaxAnnualDepreciationRate: 12.5,
  });
});

test('clearing the useful life clears the rate and a category without code or name is not saved', async () => {
  const onSubmit = jest.fn();
  renderForm(onSubmit);

  fireEvent.change(field('useful-life-in-years'), { target: { value: '4' } });
  fireEvent.change(field('useful-life-in-years'), { target: { value: '' } });
  expect(field('annual-depreciation-rate')).toHaveProperty('value', '');

  fireEvent.click(screen.getByRole('button', { name: 'save-category' }));

  expect(await screen.findAllByRole('alert')).toHaveLength(2);
  expect(onSubmit).not.toHaveBeenCalled();
});
