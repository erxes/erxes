import { format } from 'date-fns';
import { cn, displayNum, ReportTable } from 'erxes-ui';
import { useNavigate } from 'react-router-dom';
import { ReportRules } from '~/modules/journal-reports/types/reportsMap';
import {
  TR_JOURNAL_LABELS,
  TR_SIDES,
  TrJournalEnum,
} from '~/modules/transactions/types/constants';
import { buildTransactionEditPath } from '~/modules/transactions/utils/transactionNavigation';
import { RenderMoreProps } from '../types';

type TransactionDetail = {
  amount?: number;
  currencyAmount?: number;
  count?: number;
  unitPrice?: number;
  relAccounts?: unknown;
};

type TransactionDetailRecord = {
  _id?: string;
  originId?: string;
  parentId?: string;
  date?: string | Date;
  number?: string;
  ptrNumber?: string;
  journal?: string;
  description?: string;
  side?: string;
  detailInd?: number;
  details?: TransactionDetail;
};

const toRecord = (record: Record<string, unknown>): TransactionDetailRecord =>
  record;

const formatRelatedAccounts = (value: unknown) => {
  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === 'string')
      .join(', ');
  }

  if (!value || typeof value !== 'object') {
    return '';
  }

  return Object.values(value)
    .flatMap((item) => (Array.isArray(item) ? item : [item]))
    .filter((item): item is string => typeof item === 'string')
    .join(', ');
};

export const HandleTransactionMore = ({
  report,
  moreData,
  currentKey,
}: RenderMoreProps) => {
  const navigate = useNavigate();
  const columnCount = (ReportRules[report]?.colCount || 0) + 2;

  if (!moreData.length) {
    return null;
  }

  const handleOpenTransaction = (transaction: TransactionDetailRecord) => {
    const trId = transaction.originId || transaction._id;
    if (!transaction.parentId || !trId) {
      return;
    }

    navigate(
      buildTransactionEditPath({
        parentId: transaction.parentId,
        trId,
      }),
    );
  };

  return (
    <ReportTable.Row key={currentKey} data-draw-zero="1">
      <ReportTable.Cell colSpan={columnCount} className="p-0">
        <ReportTable>
          <ReportTable.Header>
            <ReportTable.Row>
              <ReportTable.Head>Огноо</ReportTable.Head>
              <ReportTable.Head>Дугаар</ReportTable.Head>
              <ReportTable.Head>Журнал</ReportTable.Head>
              <ReportTable.Head>Гүйлгээний утга</ReportTable.Head>
              <ReportTable.Head>Тоо</ReportTable.Head>
              <ReportTable.Head>Нэгж үнэ</ReportTable.Head>
              <ReportTable.Head>Валют дүн</ReportTable.Head>
              <ReportTable.Head>Дебет</ReportTable.Head>
              <ReportTable.Head>Кредит</ReportTable.Head>
              <ReportTable.Head>Харьцсан данс</ReportTable.Head>
            </ReportTable.Row>
          </ReportTable.Header>
          <ReportTable.Body>
            {moreData.map((item) => {
              const transaction = toRecord(item);
              const details = transaction.details || {};
              const transactionId = transaction.originId || transaction._id;
              const canOpen = Boolean(transaction.parentId && transactionId);

              return (
                <ReportTable.Row
                  key={`${transaction._id}-${transaction.detailInd}`}
                  className={cn(canOpen && 'cursor-pointer')}
                  onDoubleClick={() => handleOpenTransaction(transaction)}
                >
                  <ReportTable.Cell className="text-left">
                    {transaction.date
                      ? format(new Date(transaction.date), 'yyyy-MM-dd')
                      : ''}
                  </ReportTable.Cell>
                  <ReportTable.Cell className="text-left">
                    {transaction.ptrNumber || transaction.number || ''}
                  </ReportTable.Cell>
                  <ReportTable.Cell className="text-left">
                    {TR_JOURNAL_LABELS[transaction.journal as TrJournalEnum] ||
                      transaction.journal}
                  </ReportTable.Cell>
                  <ReportTable.Cell className="text-left">
                    {transaction.description || ''}
                  </ReportTable.Cell>
                  <ReportTable.Cell className="text-right">
                    {displayNum(details.count)}
                  </ReportTable.Cell>
                  <ReportTable.Cell className="text-right">
                    {displayNum(details.unitPrice)}
                  </ReportTable.Cell>
                  <ReportTable.Cell className="text-right">
                    {displayNum(details.currencyAmount)}
                  </ReportTable.Cell>
                  <ReportTable.Cell className="text-right">
                    {transaction.side === TR_SIDES.DEBIT
                      ? displayNum(details.amount)
                      : ''}
                  </ReportTable.Cell>
                  <ReportTable.Cell className="text-right">
                    {transaction.side === TR_SIDES.CREDIT
                      ? displayNum(details.amount)
                      : ''}
                  </ReportTable.Cell>
                  <ReportTable.Cell className="text-left">
                    {formatRelatedAccounts(details.relAccounts)}
                  </ReportTable.Cell>
                </ReportTable.Row>
              );
            })}
          </ReportTable.Body>
        </ReportTable>
      </ReportTable.Cell>
    </ReportTable.Row>
  );
};
