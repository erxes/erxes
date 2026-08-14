import { format } from 'date-fns';
import { cn, displayNum, ReportTable } from 'erxes-ui';
import { useNavigate } from 'react-router-dom';
import { TR_SIDES } from '~/modules/transactions/types/constants';

type ReportRecord = Record<string, unknown>;

type AccountStatementMoreRecord = ReportRecord & {
  _id?: string;
  date?: string | Date;
  parentId?: string;
  originId?: string;
  number?: string;
  description?: string;
  side?: string;
  detailInd?: number;
  details?: {
    amount?: number;
    currencyAmount?: number;
    relAccounts?: string;
  };
  remainder?: number;
};

const toAccountStatementRecord = (
  record: ReportRecord,
): AccountStatementMoreRecord => record;

export const HandleMainACMore = ({
  moreData,
  currentKey,
  nodeExtra,
}: {
  moreData: ReportRecord[];
  currentKey: string;
  nodeExtra?: Record<string, unknown>;
}) => {
  const frDiff = typeof nodeExtra?.fr_diff === 'number' ? nodeExtra.fr_diff : 0;
  const navigate = useNavigate();
  const rows: AccountStatementMoreRecord[] = [];
  let rem = frDiff;

  moreData.map(toAccountStatementRecord).forEach((md) => {
    const amount = md.details?.amount || 0;
    const multiplier = md.side === TR_SIDES.DEBIT ? 1 : -1;
    rem += multiplier * amount;
    rows.push({
      ...md,
      remainder: rem,
    });
  });

  const handleOpenTransaction = (tr: AccountStatementMoreRecord) => {
    const trId = tr.originId || tr._id;

    if (!tr.parentId || !trId) {
      return;
    }

    navigate(
      `/accounting/transaction/edit?parentId=${tr.parentId}&trId=${trId}`,
    );
  };

  return (
    <ReportTable.Row key={currentKey} className={cn('text-right')}>
      <ReportTable.Cell colSpan={8} className="p-0">
        <ReportTable>
          <ReportTable.Header>
            <ReportTable.Row>
              <ReportTable.Head>Огноо</ReportTable.Head>
              <ReportTable.Head>Дугаар</ReportTable.Head>
              <ReportTable.Head>Харилцагч</ReportTable.Head>
              <ReportTable.Head>Гүйлгээний утга</ReportTable.Head>
              <ReportTable.Head>Валют дүн</ReportTable.Head>
              <ReportTable.Head>Дебет</ReportTable.Head>
              <ReportTable.Head>Кредит</ReportTable.Head>
              <ReportTable.Head>Үлдэгдэл</ReportTable.Head>
              <ReportTable.Head>Харьцсан данс</ReportTable.Head>
            </ReportTable.Row>
          </ReportTable.Header>
          <ReportTable.Body>
            {rows.map((tr) => {
              const details = tr.details || {};

              return (
                <ReportTable.Row
                  className={cn('cursor-pointer')}
                  key={`${tr._id}-${tr.detailInd}`}
                  onDoubleClick={() => handleOpenTransaction(tr)}
                >
                  <ReportTable.Cell className="text-left">
                    {tr.date ? format(new Date(tr.date), 'yyyy-MM-dd') : ''}
                  </ReportTable.Cell>
                  <ReportTable.Cell className="text-left">
                    {tr.number}
                  </ReportTable.Cell>
                  <ReportTable.Cell className="text-left"></ReportTable.Cell>
                  <ReportTable.Cell className="text-left">
                    {tr.description}
                  </ReportTable.Cell>
                  <ReportTable.Cell className={cn(`text-right`)}>
                    {displayNum(details.currencyAmount)}
                  </ReportTable.Cell>
                  <ReportTable.Cell className={cn(`text-right`)}>
                    {tr.side === TR_SIDES.DEBIT && displayNum(details.amount)}
                  </ReportTable.Cell>
                  <ReportTable.Cell className={cn(`text-right`)}>
                    {tr.side === TR_SIDES.CREDIT && displayNum(details.amount)}
                  </ReportTable.Cell>
                  <ReportTable.Cell className={cn(`text-right `)}>
                    {displayNum(tr.remainder ?? 0)}
                  </ReportTable.Cell>
                  <ReportTable.Cell className={cn(`text-left `)}>
                    {details.relAccounts ?? ''}
                  </ReportTable.Cell>
                </ReportTable.Row>
              );
            })}
          </ReportTable.Body>
          <ReportTable.Footer></ReportTable.Footer>
        </ReportTable>
      </ReportTable.Cell>
    </ReportTable.Row>
  );
};
