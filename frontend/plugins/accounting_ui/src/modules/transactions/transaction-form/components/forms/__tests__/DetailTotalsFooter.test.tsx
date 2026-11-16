import {
  act,
  render,
  renderHook,
  screen,
  within,
} from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { useForm } from 'react-hook-form';
import { DetailTotalsFooter } from '@/transactions/transaction-form/components/forms/DetailTotalsFooter';
import { taxPercentsState } from '@/transactions/transaction-form/states/trStates';
import { TAddTransactionGroup } from '@/transactions/transaction-form/types/JournalForms';
import { TrJournalEnum } from '@/transactions/types/constants';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('erxes-ui', () => {
  const react = jest.requireActual<typeof import('react')>('react');
  return {
    formatAmount: (value: number) => String(value),
    Table: {
      Footer: (props: React.ComponentProps<'tfoot'>) =>
        react.createElement('tfoot', props),
      Row: (props: React.ComponentProps<'tr'>) =>
        react.createElement('tr', props),
      Cell: (props: React.ComponentProps<'td'>) =>
        react.createElement('td', props),
    },
  };
});

const renderTotals = (hasVat = false, hasCtax = false, amount?: number) => {
  const store = createStore();
  store.set(taxPercentsState, {
    vat: hasVat ? 10 : 0,
    ctax: hasCtax ? 2 : 0,
    sum: (hasVat ? 10 : 0) + (hasCtax ? 2 : 0),
  });
  const { result } = renderHook(() =>
    useForm<TAddTransactionGroup>({
      defaultValues: {
        trDocs: [
          {
            journal: TrJournalEnum.INV_INCOME,
            hasVat,
            hasCtax,
            details: [
              {
                _id: 'a',
                count: 2,
                unitPrice: 100,
                amount: 200,
                weight: 3,
                checked: true,
              },
              {
                _id: 'b',
                count: 3,
                unitPrice: 100,
                amount: 300,
                weight: 4,
                excludeVat: true,
              },
              {
                _id: 'c',
                count: 1,
                unitPrice: 100,
                amount: 100,
                weight: 0,
                excludeCtax: true,
              },
            ],
          },
        ],
      },
    }),
  );
  render(
    <Provider store={store}>
      <table>
        <DetailTotalsFooter
          form={result.current}
          journalIndex={0}
          leadingColumns={5}
          columns={['count', null, 'amount', 'tax', 'weight', null, null]}
          amount={amount}
        />
      </table>
    </Provider>,
  );
  return result;
};

const cells = () => within(screen.getByRole('row')).getAllByRole('cell');

test.each([
  [false, false, null],
  [true, false, '630'],
  [false, true, '610'],
  [true, true, '640'],
])(
  'aligns totals with optional tax columns (VAT=%s, CTAX=%s)',
  (vat, ctax, expectedTax) => {
    renderTotals(vat, ctax);
    const row = cells();
    expect(row[0].getAttribute('colspan')).toBe('5');
    expect(row[1].textContent).toBe('6');
    expect(row[2].textContent).toBe('');
    expect(row[3].textContent).toBe('600');
    const taxColumns =
      expectedTax === null ? 0 : Number(vat) + Number(ctax) + 2;
    expect(row).toHaveLength(7 + taxColumns);
    if (expectedTax !== null)
      expect(row[3 + taxColumns].textContent).toBe(expectedTax);
    expect(row[4 + taxColumns].textContent).toBe('7');
  },
);

test('updates totals after edits, appended rows, removal and clearing details', () => {
  const form = renderTotals();
  act(() => form.current.setValue('trDocs.0.details.0.count', 5));
  expect(cells()[1].textContent).toBe('9');
  act(() =>
    form.current.setValue('trDocs.0.details', [
      ...form.current.getValues('trDocs.0.details'),
      { _id: 'd', accountId: '', count: 2, amount: 40, weight: 1 },
    ]),
  );
  expect(cells()[1].textContent).toBe('11');
  expect(cells()[3].textContent).toBe('640');
  act(() =>
    form.current.setValue(
      'trDocs.0.details',
      form.current.getValues('trDocs.0.details').slice(1),
    ),
  );
  expect(cells()[1].textContent).toBe('6');
  expect(cells()[3].textContent).toBe('440');
  act(() => form.current.setValue('trDocs.0.details', []));
  expect(cells()[1].textContent).toBe('0');
  expect(cells()[3].textContent).toBe('0');
});

test('preserves a signed capitalization or revaluation total', () => {
  renderTotals(false, false, -250);
  expect(cells()[3].textContent).toBe('-250');
});
