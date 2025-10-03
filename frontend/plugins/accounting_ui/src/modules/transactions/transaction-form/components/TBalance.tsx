import { followTrDocsState } from '../states/trStates';
import { ITBalanceTransaction } from '../types/TBalance';
import { ITransactionGroupForm } from '../types/JournalForms';
import { ITrDetail } from '../../types/Transaction';
import { RecordTable } from 'erxes-ui';
import { tbalanceColumns } from './TBalanceTableColumns';
import { TBalanceTableRow } from './TBalanceTableRow';
import { useAtomValue } from 'jotai';
import { useWatch } from 'react-hook-form';

export const TBalance = (
  { form }: {
    form: ITransactionGroupForm;
  }
) => {
  const date = useWatch({
    control: form.control,
    name: 'date'
  });

  const number = useWatch({
    control: form.control,
    name: 'number'
  });

  const trDocs = useWatch({
    control: form.control,
    name: `trDocs`
  });

  const followTrDocs = useAtomValue(followTrDocsState);

  const data: ITBalanceTransaction[] = [];
  (trDocs || []).forEach((activeTr, index) => {
    activeTr.details.forEach((detail) => {
      data.push({ ...activeTr, date, number, detail: detail as ITrDetail, journalIndex: index.toString() });
    });
    (followTrDocs || []).filter(ftr => ftr.originId === activeTr._id && ftr.ptrId === activeTr.ptrId).forEach((ftr) => {
      ftr.details.forEach((followDet) => {
        data.push({ ...ftr, date, number, detail: followDet as ITrDetail, journalIndex: index.toString() });
      });
    })
  });

  (trDocs || []).forEach((activeTr, index) => {
    (followTrDocs || []).filter(ftr => ftr.originId === activeTr._id && ftr.ptrId !== activeTr.ptrId).forEach((ftr) => {
      ftr.details.forEach((followDet) => {
        data.push({ ...ftr, date, number, detail: followDet as ITrDetail, journalIndex: index.toString() });
      });
    })
  })

  return (
    <RecordTable.Provider
      columns={tbalanceColumns}
      data={data || []}
      stickyColumns={[]}
      className='m-3'
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
  );
};
