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

test('total is authoritative across unit edits, quantity changes and explicit zero', () => {
  const { result } = renderHook(() =>
    useForm<TAddTransactionGroup>({
      defaultValues: {
        trDocs: [
          {
            journal: TrJournalEnum.FXA_INCOME,
            details: [
              { _id: 'row', count: 3, followInfos: { preDeprecation: 15000 } },
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
    <FxaDepreciationFields form={result.current} index={0} detailIndex={0} />,
  );
  const unit = screen.getByLabelText('fxa-new-unit-depreciation');
  const total = screen.getByLabelText(
    'total-amount prior-accumulated-depreciation',
  );
  expect(unit).toHaveProperty('value', '5000');
  fireEvent.change(unit, { target: { value: '6000' } });
  expect(
    result.current.getValues('trDocs.0.details.0.followInfos.preDeprecation'),
  ).toBe(18000);
  act(() => result.current.setValue('trDocs.0.details.0.count', 2));
  expect(array.result.current.fields[0].id).toBe(rowId);
  expect(unit).toHaveProperty('value', '9000');
  expect(total).toHaveProperty('value', '18000');
  fireEvent.change(total, { target: { value: '0' } });
  expect(unit).toHaveProperty('value', '0');
  expect(
    result.current.getValues('trDocs.0.details.0.followInfos.preDeprecation'),
  ).toBe(0);
});

test('location totals retain the authoritative total after rounding', () => {
  expect(allocateFxaDepreciation(100, [1, 1, 1])).toEqual([
    33.3333, 33.3333, 33.3334,
  ]);
});
