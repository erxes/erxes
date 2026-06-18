import dayjs from 'dayjs';
import { ITransaction } from '~/modules/transactions/types/Transaction';
import { formatNumber, keyRows } from './shared';

const TH = 'border border-black px-1 py-1 font-medium';
const TD = 'border border-black px-1 py-1.5';

// inv_move_1 / inv_move_2 differ only in the ministry-order note suffix.
export type InvMoveVariant = 'standard' | 'byPrice';

export const PrintInvMoveDocument = ({
  transaction,
  variant = 'standard',
}: {
  transaction: ITransaction;
  variant?: InvMoveVariant;
}) => {
  const details = transaction?.details || [];

  // Each detail is one moved item; total is the sum of line values.
  const rows = details.map((d) => {
    const count = d.count ?? 0;
    const lineAmount = d.amount ?? count * (d.unitPrice ?? 0);
    const unitPrice = d.unitPrice ?? (count > 0 ? lineAmount / count : 0);

    return {
      name: d.product?.name || d.account?.name || '',
      unit: d.product?.uom || '',
      from: d.branch?.title || '',
      fromAccount: d.account?.code || '',
      to: d.department?.title || '',
      toAccount: '',
      count,
      unitPrice,
      lineAmount,
    };
  });

  const total = rows.reduce((sum, r) => sum + r.lineAmount, 0);

  const date = transaction?.date
    ? dayjs(transaction.date).format('YYYY.MM.DD')
    : '';
  const description = transaction?.description || '';

  return (
    <div
      id="print-area"
      className="w-[297mm] min-h-[210mm] bg-white px-[14mm] py-[12mm] font-serif text-[12px] leading-snug text-black shadow-sidebar-inset"
    >
      <div className="flex items-start justify-between text-[11px]">
        <div className="font-medium">НХМаягт БМ3</div>
        <div className="text-right leading-tight">
          Санхүү эдийн засгийн сайд Үндэсний
          <br />
          статистикийн газрын даргын 2002 оны
          <br />
          6-р сарын 18-ны 171/111 тоот
          <br />
          тушаалын хавсралт
          {variant === 'byPrice' ? ' (үнээр)' : ''}
        </div>
      </div>

      <div className="mt-3 border-b border-black pb-1 font-bold">
        Байгууллага:
      </div>

      <div className="mt-3 mb-2 text-center text-[15px] font-bold">
        Дотоод хөдөлгөөн
      </div>

      <div className="font-bold">Огноо: {date}</div>
      <div className="mb-2 font-bold">Утга: {description}</div>

      <table className="w-full border-collapse border border-black text-[11px]">
        <thead>
          <tr>
            <th className={`${TH} w-8`}>№</th>
            <th className={`${TH} px-2`}>Бараа материал</th>
            <th className={TH}>Хэмжих нэгж</th>
            <th className={TH}>Хаанаас</th>
            <th className={TH}>Данснаас</th>
            <th className={TH}>Хаашаа</th>
            <th className={TH}>Дансанд</th>
            <th className={TH}>Тоо</th>
            <th className={TH}>Нэгжийн үнэ</th>
            <th className={TH}>Үнэ</th>
          </tr>
        </thead>
        <tbody>
          {keyRows(rows).map(({ key, index, row }) => (
            <tr key={key}>
              <td className={`${TD} text-center`}>{index + 1}</td>
              <td className={`${TD} px-2`}>{row?.name || ' '}</td>
              <td className={`${TD} text-center`}>{row?.unit || ' '}</td>
              <td className={TD}>{row?.from || ' '}</td>
              <td className={TD}>{row?.fromAccount || ' '}</td>
              <td className={TD}>{row?.to || ' '}</td>
              <td className={TD}>{row?.toAccount || ' '}</td>
              <td className={`${TD} text-right`}>
                {row?.count ? row.count.toLocaleString() : ' '}
              </td>
              <td className={`${TD} text-right`}>
                {row?.unitPrice ? formatNumber(row.unitPrice) : ' '}
              </td>
              <td className={`${TD} text-right`}>
                {row ? formatNumber(row.lineAmount) : ' '}
              </td>
            </tr>
          ))}
          <tr>
            <td className={TD} />
            <td className={`${TD} px-2 text-center font-medium`}>Дүн</td>
            <td className={TD} colSpan={6} />
            <td className={`${TD} text-right`} />
            <td className={`${TD} text-right font-bold`}>
              {formatNumber(total)}
            </td>
          </tr>
        </tbody>
      </table>

      <div className="mt-10 space-y-3 text-[11px]">
        <div className="flex items-end justify-center gap-2">
          <span className="shrink-0">Хүлээн авсан:</span>
          <span className="inline-block w-72 border-b border-dotted border-black" />
          <span>/</span>
          <span className="inline-block w-72 border-b border-dotted border-black" />
          <span>/</span>
        </div>
        <div className="flex items-end justify-center gap-2">
          <span className="shrink-0">Хүлээлгэн өгсөн:</span>
          <span className="inline-block w-72 border-b border-dotted border-black" />
          <span>/</span>
          <span className="inline-block w-72 border-b border-dotted border-black" />
          <span>/</span>
        </div>
      </div>
    </div>
  );
};

// Ready-to-register variants for the print document registry.
export const PrintInvMoveStandardDocument = ({
  transaction,
}: {
  transaction: ITransaction;
}) => <PrintInvMoveDocument transaction={transaction} variant="standard" />;

export const PrintInvMoveByPriceDocument = ({
  transaction,
}: {
  transaction: ITransaction;
}) => <PrintInvMoveDocument transaction={transaction} variant="byPrice" />;
