import dayjs from 'dayjs';
import { fixNum } from 'erxes-ui';
import { ITransaction, ITrDetail } from '~/modules/transactions/types/Transaction';
import { TrJournalEnum } from '~/modules/transactions/types/constants';
import { amountToMongolianText } from './numberToWords';
import { Field, VoucherHeader } from './shared';

// Journals whose details carry products (count / unitPrice) — printed as an item table.
const INVENTORY_JOURNALS = new Set<TrJournalEnum>([
  TrJournalEnum.INV_INCOME,
  TrJournalEnum.INV_OUT,
  TrJournalEnum.INV_MOVE,
  TrJournalEnum.INV_SALE,
  TrJournalEnum.INV_SALE_RETURN,
]);

// Document title shown for each journal type.
const DOCUMENT_TITLES: Partial<Record<TrJournalEnum, string>> = {
  [TrJournalEnum.MAIN]: 'Ерөнхий гүйлгээний баримт',
  [TrJournalEnum.CASH]: 'Кассын баримт',
  [TrJournalEnum.BANK]: 'Төлбөрийн даалгавар',
  [TrJournalEnum.RECEIVABLE]: 'Авлагын баримт',
  [TrJournalEnum.PAYABLE]: 'Өглөгийн баримт',
  [TrJournalEnum.INV_INCOME]: 'Барааны орлогын баримт',
  [TrJournalEnum.INV_OUT]: 'Хангамжийн зарлагын баримт',
  [TrJournalEnum.INV_MOVE]: 'Дотоод хөдөлгөөний баримт',
  [TrJournalEnum.INV_SALE]: 'Борлуулалтын баримт',
  [TrJournalEnum.INV_SALE_RETURN]: 'Борлуулалт буцаалтын баримт',
};

const formatNumber = (value: number) => fixNum(value, 2).toLocaleString();

// Item table for inventory journals (count / unitPrice based details).
const ProductTable = ({ details }: { details: ITrDetail[] }) => {
  const rows = details.filter((d) => d.productId || d.product);
  const total = rows.reduce(
    (sum, d) => sum + (d.amount ?? (d.count ?? 0) * (d.unitPrice ?? 0)),
    0,
  );

  return (
    <table className="w-full border-collapse border border-black/60 text-[12px]">
      <thead>
        <tr className="bg-black/6">
          <th className="border border-black/60 px-2 py-1 text-center font-medium w-8">
            №
          </th>
          <th className="border border-black/60 px-2 py-1 text-left font-medium">
            Барааны нэр
          </th>
          <th className="border border-black/60 px-2 py-1 text-left font-medium">
            Код
          </th>
          <th className="border border-black/60 px-2 py-1 text-right font-medium">
            Тоо хэмжээ
          </th>
          <th className="border border-black/60 px-2 py-1 text-right font-medium">
            Нэгж үнэ
          </th>
          <th className="border border-black/60 px-2 py-1 text-right font-medium">
            Дүн
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((d, idx) => {
          const lineAmount =
            d.amount ?? (d.count ?? 0) * (d.unitPrice ?? 0);
          return (
            <tr key={d._id || idx}>
              <td className="border border-black/60 px-2 py-1.5 text-center">
                {idx + 1}
              </td>
              <td className="border border-black/60 px-2 py-1.5">
                {d.product?.name || ' '}
              </td>
              <td className="border border-black/60 px-2 py-1.5">
                {d.product?.code || ' '}
              </td>
              <td className="border border-black/60 px-2 py-1.5 text-right">
                {(d.count ?? 0).toLocaleString()}
              </td>
              <td className="border border-black/60 px-2 py-1.5 text-right">
                {formatNumber(d.unitPrice ?? 0)}
              </td>
              <td className="border border-black/60 px-2 py-1.5 text-right">
                {formatNumber(lineAmount)}
              </td>
            </tr>
          );
        })}
        <tr className="bg-black/6">
          <td
            colSpan={5}
            className="border border-black/60 px-2 py-1.5 text-right font-medium"
          >
            Нийт дүн
          </td>
          <td className="border border-black/60 px-2 py-1.5 text-right font-bold">
            {formatNumber(total)}
          </td>
        </tr>
      </tbody>
    </table>
  );
};

// Account / amount table for monetary journals (cash, receivable, payable...).
const AccountTable = ({ details }: { details: ITrDetail[] }) => (
  <table className="w-full border-collapse border border-black/60 text-[12px]">
    <thead>
      <tr className="bg-black/6">
        <th className="border border-black/60 px-2 py-1 text-center font-medium w-8">
          №
        </th>
        <th className="border border-black/60 px-2 py-1 text-left font-medium">
          Данс
        </th>
        <th className="border border-black/60 px-2 py-1 text-left font-medium">
          Дансны нэр
        </th>
        <th className="border border-black/60 px-2 py-1 text-right font-medium">
          Дүн
        </th>
      </tr>
    </thead>
    <tbody>
      {details.map((d, idx) => {
        const amount = d.currencyAmount ?? d.amount ?? 0;
        return (
          <tr key={d._id || idx}>
            <td className="border border-black/60 px-2 py-1.5 text-center">
              {idx + 1}
            </td>
            <td className="border border-black/60 px-2 py-1.5">
              {d.account?.code || ' '}
            </td>
            <td className="border border-black/60 px-2 py-1.5">
              {d.account?.name || ' '}
            </td>
            <td className="border border-black/60 px-2 py-1.5 text-right">
              {formatNumber(amount)}
            </td>
          </tr>
        );
      })}
    </tbody>
  </table>
);

export const TransactionDocument = ({
  transaction,
}: {
  transaction: ITransaction;
}) => {
  const journal = transaction.journal;
  const details = transaction?.details || [];
  const isInventory = INVENTORY_JOURNALS.has(journal);

  const title = DOCUMENT_TITLES[journal] || 'Гүйлгээний баримт';

  const totalAmount = isInventory
    ? details.reduce(
        (sum, d) => sum + (d.amount ?? (d.count ?? 0) * (d.unitPrice ?? 0)),
        0,
      )
    : details.reduce((sum, d) => sum + (d.currencyAmount ?? d.amount ?? 0), 0);

  const amountInWords = amountToMongolianText(totalAmount);

  const description = transaction?.description || '';

  const partyName =
    transaction.customer?.firstName || transaction.customer?.code || '';

  const documentNo = transaction?.number || transaction?.ptrNumber || '';

  const transactionDate = transaction?.date
    ? dayjs(transaction.date).format('YYYY.MM.DD')
    : '';

  return (
    <div
      id="print-area"
      className="w-[210mm] min-h-[297mm] bg-white px-[18mm] py-[14mm] font-serif text-[12px] leading-snug text-black shadow-sidebar-inset"
    >
      <VoucherHeader
        title={title}
        documentNo={documentNo}
        date={transactionDate}
      />

      <div className="mb-3">
        <Field label="Харилцагч" value={partyName} />
      </div>

      {isInventory ? (
        <ProductTable details={details} />
      ) : (
        <AccountTable details={details} />
      )}

      <div className="mt-3">
        <Field
          label="Мөнгөн дүн (үсгээр)"
          value={amountInWords}
          className="border-x border-t border-black/60"
        />
        <Field
          label="Огноо"
          value={transactionDate}
          className="border-x border-black/60"
        />
        <div className="flex border-x border-b border-black/60">
          <div className="w-[42%] shrink-0 bg-black/4 px-2 py-1 font-medium">
            Гүйлгээний утга
          </div>
          <div className="min-h-16 flex-1 px-2 py-1 whitespace-pre-wrap">
            {description || ' '}
          </div>
        </div>
      </div>

      <div className="mt-12 flex justify-between text-[12px]">
        <div className="w-1/2 text-center">
          <div className="mx-auto mt-8 w-52 border-t border-black pt-1">
            Ерөнхий нягтлан бодогч
          </div>
        </div>
        <div className="w-1/2 text-center">
          <div className="mx-auto mt-8 w-52 border-t border-black pt-1">
            Гарын үсэг / Тамга
          </div>
        </div>
      </div>
    </div>
  );
};
