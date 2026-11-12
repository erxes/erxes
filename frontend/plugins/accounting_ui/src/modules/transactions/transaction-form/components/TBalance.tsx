import { useTranslation } from 'react-i18next';
import { IconReceiptOff } from '@tabler/icons-react';
import { AccountingEmptyState } from '@/layout/components/AccountingEmptyState';
import { followTrDocsState } from '../states/trStates';
import { ITBalanceTransaction } from '../types/TBalance';
import { ITransactionGroupForm } from '../types/JournalForms';
import { ITrDetail } from '../../types/Transaction';
import { RecordTable } from 'erxes-ui';
import { tbalanceColumns } from './TBalanceTableColumns';
import { TBalanceTableRow } from './TBalanceTableRow';
import { useAtomValue } from 'jotai';
import { useWatch } from 'react-hook-form';
import { useMemo } from 'react';

export const TBalance = ({ form }: { form: ITransactionGroupForm }) => {
  const { t } = useTranslation('accounting');
  const date = useWatch({
    control: form.control,
    name: 'date',
  });

  const number = useWatch({
    control: form.control,
    name: 'number',
  });

  const trDocs = useWatch({
    control: form.control,
    name: `trDocs`,
  });

  const followTrDocs = useAtomValue(followTrDocsState);

  const data: ITBalanceTransaction[] = [];

  (trDocs || []).forEach((activeTr, index) => {
    activeTr.details.forEach((detail) => {
      data.push({
        ...activeTr,
        date,
        number,
        detail: detail as ITrDetail,
        journalIndex: index.toString(),
      });
    });
    (followTrDocs || [])
      .filter(
        (ftr) => ftr.originId === activeTr._id && ftr.ptrId === activeTr.ptrId,
      )
      .forEach((ftr) => {
        ftr.details.forEach((followDet) => {
          data.push({
            ...ftr,
            date,
            number,
            detail: followDet as ITrDetail,
            journalIndex: index.toString(),
          });
        });
      });
  });

  (trDocs || []).forEach((activeTr, index) => {
    (followTrDocs || [])
      .filter(
        (ftr) => ftr.originId === activeTr._id && ftr.ptrId !== activeTr.ptrId,
      )
      .forEach((ftr) => {
        ftr.details.forEach((followDet) => {
          data.push({
            ...ftr,
            date,
            number,
            detail: followDet as ITrDetail,
            journalIndex: index.toString(),
          });
        });
      });
  });

  const rowsByPointer = new Map<string | undefined, ITBalanceTransaction[]>();
  for (const row of data) {
    const group = rowsByPointer.get(row.ptrId);
    if (group) group.push(row);
    else rowsByPointer.set(row.ptrId, [row]);
  }

  const columns = useMemo(() => {
    const hasItemJournal = (trDocs || []).some(
      (tr) => tr.journal.includes('inv') || tr.journal.includes('fxa'),
    );
    if (!hasItemJournal) {
      return tbalanceColumns(t).filter((column) => !column.id?.includes('details'));
    }
    return tbalanceColumns(t);
  }, [trDocs, t]);

  const tableData = [...rowsByPointer.values()].flat();

  return (
    <>
      <RecordTable.Provider
        columns={columns}
        data={tableData}
        stickyColumns={['more', 'account']}
        tableId="accounting_transaction_balance_record_table"
        className="m-3"
      >
        <RecordTable.Scroll>
          <RecordTable>
            <RecordTable.Header />
            <RecordTable.Body>
              <TBalanceTableRow />
            </RecordTable.Body>
          </RecordTable>
        </RecordTable.Scroll>
      </RecordTable.Provider>
      {!tableData.length && (
        <AccountingEmptyState
          icon={IconReceiptOff}
          title={t('no-transactions')}
        />
      )}
    </>
  );
};
