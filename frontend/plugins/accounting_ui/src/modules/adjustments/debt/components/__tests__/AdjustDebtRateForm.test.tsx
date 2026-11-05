import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import type { ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  adjustDebtRateSchema,
  TAdjustDebtRateForm,
} from '@/adjustments/debt/types/adjustDebtRateSchema';
import { AdjustDebtRateForm } from '@/adjustments/debt/components/AdjustDebtRateForm';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('erxes-ui', () => {
  const { Controller, FormProvider } = jest.requireActual('react-hook-form');
  return { Form: Object.assign(FormProvider, { Field: Controller }) };
});
jest.mock('ui-modules', () => {
  const Contact =
    (kind: string) =>
    ({ value }: { value: string }) =>
      <output aria-label={kind}>{value}</output>;
  return {
    CustomerType: { CUSTOMER: 'customer', COMPANY: 'company' },
    PanelFormRow: ({ children }: { children: ReactNode }) => (
      <div>{children}</div>
    ),
    PanelFormLayout: ({ children }: { children: ReactNode }) => (
      <>
        {children}
        <button type="submit">save</button>
      </>
    ),
    ActivityLogs: () => null,
    SelectCustomer: { InlineCell: Contact('customer') },
    SelectCompany: { InlineCell: Contact('company') },
  };
});
jest.mock('@/adjustments/components/AdjustPanelFields', () => ({
  AdjustRateCurrencyFields: () => null,
  AdjustRateAccountFields: () => null,
  AdjustDescriptionField: () => null,
  AdjustBranchDepartmentFields: () => null,
  useAdjustSpotRate: () => undefined,
}));
jest.mock('@/settings/components/panel/SettingsPanelActions', () => ({
  SettingsPanelAddButton: () => null,
}));
jest.mock('@/settings/components/panel/SettingsPanelFields', () => ({
  SettingsPanelSelect: ({
    value,
    options,
    onValueChange,
  }: {
    value?: string;
    options: { value: string; label: string }[];
    onValueChange: (value: string) => void;
  }) => (
    <select
      aria-label="customer-type"
      value={value}
      onChange={(event) => onValueChange(event.target.value)}
    >
      <option value="" />
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ),
}));

const SAVED_ADJUSTMENT: TAdjustDebtRateForm = {
  mainCurrency: 'MNT',
  currency: 'USD',
  spotRate: 3450,
  date: new Date('2026-10-01'),
  customerType: 'customer',
  customerId: 'customer-bat',
  description: '',
  gainAccountId: 'gain-account',
  lossAccountId: 'loss-account',
  branchId: '',
  departmentId: '',
};

const renderForm = (
  defaultValues: TAdjustDebtRateForm,
  onSubmit: (data: TAdjustDebtRateForm) => void,
) => {
  const Harness = () => {
    const form = useForm<TAdjustDebtRateForm>({
      resolver: zodResolver(adjustDebtRateSchema),
      defaultValues,
    });

    return (
      <AdjustDebtRateForm
        form={form}
        onSubmit={onSubmit}
        onCancel={jest.fn()}
        saving={false}
      />
    );
  };

  render(<Harness />);
};

test('choosing a company after a customer clears the picked customer before saving', async () => {
  const onSubmit = jest.fn();
  renderForm(
    { ...SAVED_ADJUSTMENT, customerType: '', customerId: '' },
    onSubmit,
  );

  fireEvent.change(screen.getByLabelText('customer-type'), {
    target: { value: 'company' },
  });
  expect(screen.getByLabelText('company').textContent).toBe('');

  fireEvent.click(screen.getByRole('button', { name: 'save' }));

  await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
  expect(onSubmit.mock.calls[0][0]).toMatchObject({
    customerType: 'company',
    customerId: '',
  });
});

test('an adjustment without gain and loss accounts is not saved', async () => {
  const onSubmit = jest.fn();
  renderForm(
    { ...SAVED_ADJUSTMENT, gainAccountId: '', lossAccountId: '' },
    onSubmit,
  );

  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: 'save' }));
  });

  expect(onSubmit).not.toHaveBeenCalled();
});
