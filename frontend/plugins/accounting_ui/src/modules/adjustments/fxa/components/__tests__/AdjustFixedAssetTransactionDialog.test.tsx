import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ControllerProps } from 'react-hook-form';
import { AdjustFixedAssetTransactionDialog } from '@/adjustments/fxa/components/AdjustFixedAssetDetail';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('erxes-ui', () => {
  const react = jest.requireActual<typeof import('react')>('react');
  const { Controller, FormProvider } =
    jest.requireActual<typeof import('react-hook-form')>('react-hook-form');
  const wrapper = ({ children }: { children: React.ReactNode }) =>
    react.createElement('div', {}, children);
  return {
    Form: Object.assign(
      (props: React.ComponentProps<typeof FormProvider>) =>
        react.createElement(FormProvider, props),
      {
        Field: (
          props: ControllerProps<{
            expenseAccountId: string;
            taxExpenseAccountId: string;
          }>,
        ) =>
          react.createElement(
            Controller<{
              expenseAccountId: string;
              taxExpenseAccountId: string;
            }>,
            props,
          ),
        Item: wrapper,
        Label: wrapper,
        Message: () => null,
      },
    ),
    Dialog: Object.assign(
      ({ children }: { children: React.ReactNode }) =>
        react.createElement('div', {}, children),
      {
        Trigger: wrapper,
        Content: wrapper,
        Header: wrapper,
        Title: wrapper,
        Description: wrapper,
        Footer: wrapper,
        Close: wrapper,
      },
    ),
    Button: (props: React.ComponentProps<'button'>) =>
      react.createElement('button', props),
    Spinner: () => null,
  };
});
jest.mock('@/settings/account/components/SelectAccount', () => ({
  SelectAccount: {
    FormItem: ({
      value,
      onValueChange,
    }: {
      value?: string;
      onValueChange: (value: string) => void;
    }) => (
      <input
        aria-label="expense-account"
        value={value || ''}
        onChange={(event) => onValueChange(event.target.value)}
      />
    ),
  },
}));
jest.mock('@/adjustments/fxa/components/AdjustFixedAssetTransactions', () => ({
  AdjustFixedAssetTransactions: () => null,
}));
jest.mock('@/adjustments/fxa/components/AdjustFxaDetailColumns', () => ({
  adjustFxaDetailColumns: () => [],
}));
jest.mock('@/adjustments/fxa/hooks/useAdjustFixedAssetActions', () => ({
  useAdjustFixedAssetActions: jest.fn(),
}));
jest.mock('@/adjustments/fxa/hooks/useAdjustFixedAssetTransaction', () => ({
  useAdjustFixedAssetTransaction: jest.fn(),
}));
jest.mock('@/adjustments/fxa/hooks/useAdjustFixedAssetRun', () => ({
  useAdjustFixedAssetRun: jest.fn(),
}));
jest.mock('@/adjustments/fxa/hooks/useAdjustFixedAssetRemove', () => ({
  useAdjustFixedAssetRemove: jest.fn(),
}));
jest.mock('@/adjustments/fxa/hooks/useAdjustFixedAssetDetail', () => ({
  useAdjustFixedAssetDetail: jest.fn(),
}));
jest.mock('@/adjustments/fxa/hooks/useAdjustFxaDetails', () => ({
  useAdjustFxaDetails: jest.fn(),
}));

test('posting starts with the remembered expense account and allows a replacement', async () => {
  const createTransaction = jest.fn();
  render(
    <AdjustFixedAssetTransactionDialog
      expenseAccountId="saved-expense"
      taxExpenseAccountId="saved-tax-expense"
      transaction={{ createTransaction, loading: false }}
      disabled={false}
    />,
  );
  const [account, taxAccount] = screen.getAllByLabelText('expense-account');
  expect(taxAccount).toHaveProperty('value', 'saved-tax-expense');
  fireEvent.change(taxAccount, {
    target: { value: 'replacement-tax-expense' },
  });
  expect(account).toHaveProperty('value', 'saved-expense');
  fireEvent.change(account, { target: { value: 'replacement-expense' } });
  fireEvent.click(screen.getByRole('button', { name: 'save' }));
  await waitFor(() =>
    expect(createTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: {
          expenseAccountId: 'replacement-expense',
          taxExpenseAccountId: 'replacement-tax-expense',
        },
      }),
    ),
  );
});
