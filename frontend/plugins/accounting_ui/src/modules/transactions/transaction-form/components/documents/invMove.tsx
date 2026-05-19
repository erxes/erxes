import dayjs from 'dayjs';
import { fixNum } from 'erxes-ui';
import { ITransaction } from '~/modules/transactions/types/Transaction';

const formatNumber = (value: number) => fixNum(value, 2).toLocaleString();

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
            <th className="w-8 border border-black px-1 py-1 font-medium">
              №
            </th>
            <th className="border border-black px-2 py-1 font-medium">
              Бараа материал
            </th>
            <th className="border border-black px-1 py-1 font-medium">
              Хэмжих нэгж
            </th>
            <th className="border border-black px-1 py-1 font-medium">
              Хаанаас
            </th>
            <th className="border border-black px-1 py-1 font-medium">
              Данснаас
            </th>
            <th className="border border-black px-1 py-1 font-medium">
              Хаашаа
            </th>
            <th className="border border-black px-1 py-1 font-medium">
              Дансанд
            </th>
            <th className="border border-black px-1 py-1 font-medium">Тоо</th>
            <th className="border border-black px-1 py-1 font-medium">
              Нэгжийн үнэ
            </th>
            <th className="border border-black px-1 py-1 font-medium">Үнэ</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx}>
              <td className="border border-black px-1 py-1.5 text-center">
                {idx + 1}
              </td>
              <td className="border border-black px-2 py-1.5">
                {row.name || ' '}
              </td>
              <td className="border border-black px-1 py-1.5 text-center">
                {row.unit || ' '}
              </td>
              <td className="border border-black px-1 py-1.5">
                {row.from || ' '}
              </td>
              <td className="border border-black px-1 py-1.5">
                {row.fromAccount || ' '}
              </td>
              <td className="border border-black px-1 py-1.5">
                {row.to || ' '}
              </td>
              <td className="border border-black px-1 py-1.5">
                {row.toAccount || ' '}
              </td>
              <td className="border border-black px-1 py-1.5 text-right">
                {row.count ? row.count.toLocaleString() : ' '}
              </td>
              <td className="border border-black px-1 py-1.5 text-right">
                {row.unitPrice ? formatNumber(row.unitPrice) : ' '}
              </td>
              <td className="border border-black px-1 py-1.5 text-right">
                {formatNumber(row.lineAmount)}
              </td>
            </tr>
          ))}
          <tr>
            <td className="border border-black px-1 py-1.5" />
            <td className="border border-black px-2 py-1.5 text-center font-medium">
              Дүн
            </td>
            <td className="border border-black px-1 py-1.5" colSpan={6} />
            <td className="border border-black px-1 py-1.5 text-right" />
            <td className="border border-black px-1 py-1.5 text-right font-bold">
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
