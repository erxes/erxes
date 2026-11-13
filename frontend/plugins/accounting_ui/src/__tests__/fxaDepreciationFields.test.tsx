import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
} from '@testing-library/react';
import { useFieldArray, useForm } from 'react-hook-form';
import { FxaDepreciationFields } from '@/transactions/transaction-form/components/forms/FxaDepreciationFields';
import { TAddTransactionGroup } from '@/transactions/transaction-form/types/JournalForms';
import { TrJournalEnum } from '@/transactions/types/constants';
import type { TFxaCapitalValuation } from '@/transactions/transaction-form/components/forms/hooks/fxaCapitalPreview';
import { allocateFxaDepreciation } from '@/transactions/transaction-form/components/helpers/fxaDepreciation';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('erxes-ui', () => {
  const react = jest.requireActual<typeof import('react')>('react');
  const wrapper = ({ children }: { children: React.ReactNode }) =>
    react.createElement('div', {}, children);
  const fieldContext = react.createContext(false);
  const FieldLabel = ({ children }: { children: React.ReactNode }) => {
    if (!react.useContext(fieldContext))
      throw new Error('Form.Label requires Form.Field');
    return react.createElement('label', {}, children);
  };
  return {
    Label: ({ children, ...props }: React.ComponentProps<'label'>) =>
      react.createElement('label', props, children),
    Form: {
      Item: wrapper,
      Label: FieldLabel,
      Control: wrapper,
      Message: () => null,
      Field: ({ render: renderField }: { render: () => React.ReactNode }) =>
        react.createElement(
          fieldContext.Provider,
          { value: true },
          renderField(),
        ),
    },
    Input: (props: React.ComponentProps<'input'>) =>
      react.createElement('input', props),
    InputNumber: ({
      value,
      onChange,
      ...props
    }: {
      value: number;
      onChange?: (value: number) => void;
    }) =>
      react.createElement('input', {
        ...props,
        value,
        onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
          onChange?.(Number(event.target.value)),
      }),
  };
});

test.each([false, true])(
  'total is authoritative across unit edits, quantity changes and explicit zero (tax=%s)',
  (tax) => {
    const rule = tax ? 'taxPreDeprecation' : 'preDeprecation';
    const otherRule = tax ? 'preDeprecation' : 'taxPreDeprecation';
    const { result } = renderHook(() =>
      useForm<TAddTransactionGroup>({
        defaultValues: {
          trDocs: [
            {
              journal: TrJournalEnum.FXA_INCOME,
              details: [
                {
                  _id: 'row',
                  count: 3,
                  followInfos: { [rule]: 15000, [otherRule]: 900 },
                },
              ],
            },
          ],
        },
      }),
    );
    const array = renderHook(() =>
      useFieldArray({
        control: result.current.control,
        name: 'trDocs.0.details',
      }),
    );
    const rowId = array.result.current.fields[0].id;
    render(
      <FxaDepreciationFields
        form={result.current}
        index={0}
        detailIndex={0}
        tax={tax}
      />,
    );
    const unit = screen.getByLabelText(
      tax ? 'tax-unit-accumulated-depreciation' : 'fxa-new-unit-depreciation',
    );
    const total = screen.getByLabelText(
      tax
        ? 'tax-total-accumulated-depreciation'
        : 'total-amount prior-accumulated-depreciation',
    );
    expect(unit).toHaveProperty('value', '5000');
    fireEvent.change(unit, { target: { value: '6000' } });
    expect(
      result.current.getValues(`trDocs.0.details.0.followInfos.${rule}`),
    ).toBe(18000);
    act(() => result.current.setValue('trDocs.0.details.0.count', 2));
    expect(array.result.current.fields[0].id).toBe(rowId);
    expect(unit).toHaveProperty('value', '9000');
    expect(total).toHaveProperty('value', '18000');
    fireEvent.change(total, { target: { value: '0' } });
    expect(unit).toHaveProperty('value', '0');
    expect(
      result.current.getValues(`trDocs.0.details.0.followInfos.${rule}`),
    ).toBe(0);
    expect(
      result.current.getValues(`trDocs.0.details.0.followInfos.${otherRule}`),
    ).toBe(900);
  },
);

test('location totals retain the authoritative total after rounding', () => {
  expect(allocateFxaDepreciation(100, [1, 1, 1])).toEqual([
    33.3333, 33.3333, 33.3334,
  ]);
});

test('revaluation unit and total edits preserve the tax difference across locations and lock tax inputs', () => {
  const valuation: TFxaCapitalValuation = {
    fixedAssetId: 'asset',
    accountId: 'cost',
    depreciationAccountId: 'dep',
    count: 3,
    originalCost: 100,
    preDeprecation: 90,
    taxPreDeprecation: 30,
    hasTaxDepreciation: true,
    incomeTaxRate: 10,
    depreciationMethod: 'straightLine',
    annualDepreciationRate: 10,
    salvageValue: 0,
    taxDepreciationMethod: 'straightLine',
    taxAnnualDepreciationRate: 20,
    taxSalvageValue: 0,
    depreciationStartDate: '2026-01-01',
    ready: true,
    revaluationLoss: 0,
    revaluationReserve: 0,
    locations: [
      {
        branchId: 'a',
        departmentId: '',
        count: 2,
        deferredTaxAsset: 4,
        deferredTaxLiability: 0,
      },
      {
        branchId: 'b',
        departmentId: '',
        count: 1,
        deferredTaxAsset: 2,
        deferredTaxLiability: 0,
      },
    ],
  };
  const { result } = renderHook(() =>
    useForm<TAddTransactionGroup>({
      defaultValues: {
        trDocs: [
          {
            journal: TrJournalEnum.FXA_REVALUATION,
            details: [
              {
                _id: 'a',
                fixedAssetId: 'asset',
                branchId: 'a',
                count: 0,
                followInfos: { preDeprecation: 60, taxPreDeprecation: 20 },
              },
              {
                _id: 'b',
                fixedAssetId: 'asset',
                branchId: 'b',
                count: 0,
                followInfos: { preDeprecation: 30, taxPreDeprecation: 10 },
              },
            ],
          },
        ],
      },
    }),
  );
  render(
    <>
      <FxaDepreciationFields
        form={result.current}
        index={0}
        detailIndex={0}
        valuation={valuation}
        revaluation
      />
      <FxaDepreciationFields
        form={result.current}
        index={0}
        detailIndex={0}
        valuation={valuation}
        revaluation
        tax
      />
    </>,
  );
  const taxTotal = screen.getByLabelText('tax-total-accumulated-depreciation');
  expect(taxTotal).toHaveProperty('disabled', true);
  expect(
    screen.getByLabelText('tax-unit-accumulated-depreciation'),
  ).toHaveProperty('disabled', true);
  fireEvent.change(
    screen.getByLabelText('total-amount prior-accumulated-depreciation'),
    { target: { value: '120' } },
  );
  expect(taxTotal).toHaveProperty('value', '60');
  expect(
    result.current
      .getValues('trDocs.0.details')
      .map((row) => row.followInfos?.taxPreDeprecation),
  ).toEqual([40, 20]);
  fireEvent.change(screen.getByLabelText('fxa-new-unit-depreciation'), {
    target: { value: '20' },
  });
  expect(taxTotal).toHaveProperty('value', '0');
  expect(
    result.current
      .getValues('trDocs.0.details')
      .map((row) => row.followInfos?.taxPreDeprecation),
  ).toEqual([0, 0]);
});
