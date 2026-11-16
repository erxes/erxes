import { formatAmount, Table } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { taxPercentsState } from '@/transactions/transaction-form/states/trStates';
import { ITransactionGroupForm } from '@/transactions/transaction-form/types/JournalForms';

type TotalColumn = 'count' | 'amount' | 'weight' | 'tax' | null;

export const DetailTotalsFooter = ({
  form,
  journalIndex,
  leadingColumns,
  columns,
  amount,
}: {
  form: ITransactionGroupForm;
  journalIndex: number;
  leadingColumns: number;
  columns: TotalColumn[];
  amount?: number;
}) => {
  const { t } = useTranslation('accounting');
  const journal = useWatch({
    control: form.control,
    name: `trDocs.${journalIndex}`,
  });
  const taxPercents = useAtomValue(taxPercentsState);
  const hasVat = journal && 'hasVat' in journal && journal.hasVat;
  const hasCtax = journal && 'hasCtax' in journal && journal.hasCtax;
  const totals = (journal?.details ?? []).reduce(
    (sum, detail) => {
      const percent =
        (taxPercents.sum ?? 0) -
        (detail.excludeVat ? taxPercents.vat ?? 0 : 0) -
        (detail.excludeCtax ? taxPercents.ctax ?? 0 : 0);
      return {
        count: sum.count + (detail.count ?? 0),
        amount: sum.amount + (detail.amount ?? 0),
        weight: sum.weight + (detail.weight ?? 0),
        // Match the tax-inclusive values displayed by the detail rows.
        amountWithTax:
          sum.amountWithTax +
          ((detail.unitPrice ?? 0) / 100) *
            (100 + percent) *
            (detail.count ?? 0),
      };
    },
    { count: 0, amount: 0, weight: 0, amountWithTax: 0 },
  );
  const values = columns.flatMap((column) => {
    if (column === 'tax') {
      return hasVat || hasCtax
        ? [
            ...(hasVat ? [null] : []),
            ...(hasCtax ? [null] : []),
            null,
            totals.amountWithTax,
          ]
        : [];
    }
    if (column === 'amount') return [amount ?? totals.amount];
    return [column ? totals[column] : null];
  });

  return (
    <Table.Footer>
      <Table.Row className="hover:bg-transparent [&>td]:border-0 [&>td:first-child]:border-0">
        <Table.Cell
          colSpan={leadingColumns}
          className="border-0 bg-transparent px-2 font-semibold"
        >
          {t('total-amount-label')}
        </Table.Cell>
        {values.map((value, index) => (
          <Table.Cell
            key={index}
            className="border-0 bg-transparent px-2 font-semibold tabular-nums"
          >
            {value === null ? null : formatAmount(value)}
          </Table.Cell>
        ))}
      </Table.Row>
    </Table.Footer>
  );
};
