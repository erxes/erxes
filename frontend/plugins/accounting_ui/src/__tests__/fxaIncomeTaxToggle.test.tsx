import { fireEvent, render, renderHook, screen } from '@testing-library/react';
import { useForm, type ControllerProps } from 'react-hook-form';
import { FxaIncomeDetailOwnerRecordsSheet } from '@/transactions/transaction-form/components/forms/FxaIncomeForm/FxaIncomeOwnerRecordsSheet';
import { fxaIncomeDetailSchema } from '@/transactions/transaction-form/contants/transactionSchema';
import type { TAddTransactionGroup } from '@/transactions/transaction-form/types/JournalForms';
import { TrJournalEnum } from '@/transactions/types/constants';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  getI18n: () => ({ t: (key: string) => key, language: 'en' }),
}));
jest.mock('ui-modules', () => ({ SelectMember: { FormItem: () => null } }));
jest.mock(
  '@/transactions/transaction-form/components/forms/FxaDepreciationFields',
  () => ({ FxaDepreciationFields: () => null }),
);
jest.mock(
  '@/transactions/transaction-form/components/forms/FxaChangeFields',
  () => ({
    FxaChangeMethodField: () => null,
    FxaChangeLifeFields: () => null,
    FxaChangeNumberField: () => null,
  }),
);
jest.mock('erxes-ui', () => {
  const react = jest.requireActual<typeof import('react')>('react');
  const { Controller } =
    jest.requireActual<typeof import('react-hook-form')>('react-hook-form');
  const wrapper = ({ children }: { children: React.ReactNode }) =>
    react.createElement('div', {}, children);
  return {
    cn: (...values: string[]) => values.filter(Boolean).join(' '),
    Form: {
      Field: (props: ControllerProps<TAddTransactionGroup>) =>
        react.createElement(Controller<TAddTransactionGroup>, props),
      Item: wrapper,
      Label: wrapper,
      Control: wrapper,
      Message: () => null,
    },
    Switch: ({
      checked,
      onCheckedChange,
      id,
    }: {
      checked: boolean;
      onCheckedChange: (value: boolean) => void;
      id: string;
    }) =>
      react.createElement('input', {
        type: 'checkbox',
        role: 'switch',
        id,
        checked,
        onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
          onCheckedChange(event.target.checked),
      }),
    Label: (props: React.ComponentProps<'label'>) =>
      react.createElement('label', props),
    Input: (props: React.ComponentProps<'input'>) =>
      react.createElement('input', props),
    Button: (props: React.ComponentProps<'button'>) =>
      react.createElement('button', props),
    RecordTable: { MoreButton: () => null },
    Sheet: Object.assign(wrapper, {
      Trigger: wrapper,
      View: wrapper,
      Header: wrapper,
      Content: wrapper,
      Title: wrapper,
      Description: wrapper,
      Close: () => null,
    }),
    Tooltip: Object.assign(wrapper, { Trigger: wrapper, Content: wrapper }),
    Table: Object.assign(wrapper, {
      Header: wrapper,
      Row: wrapper,
      Head: wrapper,
      Body: wrapper,
      Cell: wrapper,
    }),
  };
});

test.each([true, false, undefined])(
  'tax toggle restores saved %s and survives sheet remounts without clearing hidden tax values',
  (hasTaxDepreciation) => {
    const { result } = renderHook(() =>
      useForm<TAddTransactionGroup>({
        defaultValues: {
          trDocs: [
            {
              journal: TrJournalEnum.FXA_INCOME,
              details: [
                {
                  _id: 'detail',
                  count: 5,
                  followInfos: {
                    hasTaxDepreciation,
                    taxPreDeprecation: 600,
                    incomeTaxRate: 10,
                  },
                },
              ],
              extraData: { fxaOwnerRecords: [] },
            },
          ],
        },
      }),
    );
    const mount = () =>
      render(
        <FxaIncomeDetailOwnerRecordsSheet
          form={result.current}
          journalIndex={0}
          detailIndex={0}
        />,
      );
    const view = mount();
    expect(screen.getByRole('switch')).toHaveProperty(
      'checked',
      hasTaxDepreciation === true,
    );
    fireEvent.click(screen.getByRole('switch'));
    const next = hasTaxDepreciation !== true;
    expect(
      result.current.getValues(
        'trDocs.0.details.0.followInfos.hasTaxDepreciation',
      ),
    ).toBe(next);
    view.unmount();
    mount();
    expect(screen.getByRole('switch')).toHaveProperty('checked', next);
    expect(
      result.current.getValues(
        'trDocs.0.details.0.followInfos.taxPreDeprecation',
      ),
    ).toBe(600);
    expect(
      result.current.getValues('trDocs.0.details.0.followInfos.incomeTaxRate'),
    ).toBe(10);
  },
);

test('opening difference requires a separate income tax percentage only when enabled', () => {
  const info = {
    fixedAssetCategoryId: 'category',
    fixedAssetCode: 'A',
    fixedAssetName: 'Asset',
    preDeprecation: 1000,
    taxPreDeprecation: 600,
  };
  expect(
    fxaIncomeDetailSchema.shape.followInfos.safeParse({
      ...info,
      hasTaxDepreciation: false,
    }).success,
  ).toBe(true);
  const missing = fxaIncomeDetailSchema.shape.followInfos.safeParse({
    ...info,
    hasTaxDepreciation: true,
  });
  expect(missing.success).toBe(false);
  if (!missing.success)
    expect(missing.error.issues[0].path).toEqual(['incomeTaxRate']);
  expect(
    fxaIncomeDetailSchema.shape.followInfos.safeParse({
      ...info,
      hasTaxDepreciation: true,
      incomeTaxRate: 10,
    }).success,
  ).toBe(true);
});
