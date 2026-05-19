import dayjs from 'dayjs';
import { fixNum } from 'erxes-ui';
import { ITransaction } from '~/modules/transactions/types/Transaction';

const formatNumber = (value: number) => fixNum(value, 2).toLocaleString();

interface IReturnRow {
  name: string;
  unit: string;
  count: number;
  unitPrice: number;
  amount: number;
}

const buildRows = (transaction: ITransaction): IReturnRow[] =>
  (transaction?.details || []).map((d) => {
    const count = d.count ?? 0;
    const amount = d.amount ?? count * (d.unitPrice ?? 0);
    const unitPrice = d.unitPrice ?? (count > 0 ? amount / count : amount);
    const code = d.product?.code || d.account?.code || '';
    const name = d.product?.name || d.account?.name || '';

    return {
      name: code ? `${code} - ${name}` : name,
      unit: d.product?.uom || '',
      count,
      unitPrice,
      amount,
    };
  });

const FormHeader = ({ code }: { code: string }) => (
  <div className="flex items-start justify-between text-[11px]">
    <div className="font-medium">{code}</div>
    <div className="text-right leading-tight">
      Сангийн сайдын 2017 оны 347 дугаар
      <br />
      тушаалын хавсралт
    </div>
  </div>
);

// One signature line, e.g. "Хүлээн авсан: ......./......./".
const SignLine = ({ label }: { label: string }) => (
  <div className="flex items-end gap-2 text-[11px]">
    <span className="shrink-0">{label}:</span>
    <span className="inline-block flex-1 border-b border-dotted border-black" />
    <span>/</span>
    <span className="inline-block w-56 border-b border-dotted border-black" />
    <span>/</span>
  </div>
);

export const PrintInvSaleReturnDocument = ({
  transaction,
}: {
  transaction: ITransaction;
}) => {
  const rows = buildRows(transaction);
  const subTotal = rows.reduce((sum, r) => sum + r.amount, 0);
  const vatAmount = transaction?.vatAmount ?? 0;
  const total = subTotal + vatAmount;
  const filled = [...rows, ...Array(Math.max(0, 5 - rows.length)).fill(null)];

  const documentNo = transaction?.number || transaction?.ptrNumber || '';
  const date = transaction?.date ? dayjs(transaction.date) : null;
  const dateText = date
    ? `${date.year()} он ${date.month() + 1} сар ${date.date()} өдөр`
    : '20... он ... сар ... өдөр';
  const description = transaction?.description || '';
  const supplier =
    transaction.customer?.firstName || transaction.customer?.code || '';

  return (
    <div
      id="print-area"
      className="w-[210mm] min-h-[297mm] bg-white px-[16mm] py-[14mm] font-serif text-[12px] leading-snug text-black shadow-sidebar-inset"
    >
      <FormHeader code="НХМаягт БМ-2" />
      <div className="mt-1 border-b border-black pb-1 font-bold">
        Байгууллагын нэр:{' '}
        <span className="font-normal">
          {transaction?.branch?.title || ''}
        </span>
      </div>

      <div className="mt-3 mb-3 text-center text-[16px] font-bold uppercase">
        Орлогын баримт №{' '}
        <span className="underline">{documentNo || ' '}</span>
      </div>

      <div className="font-bold">{dateText}</div>
      <div className="mt-1 font-bold">
        Бэлтгэн нийлүүлэгчийн нэр:{' '}
        <span className="font-normal">{supplier}</span>
      </div>
      <div className="mt-1 mb-2 font-bold">
        Утга: <span className="font-normal">{description}</span>
      </div>

      <table className="w-full border-collapse border border-black text-[11px]">
        <thead>
          <tr>
            <th
              rowSpan={2}
              className="w-8 border border-black px-1 py-1 font-medium"
            >
              №
            </th>
            <th
              rowSpan={2}
              className="border border-black px-2 py-1 font-medium"
            >
              Материалын үнэт зүйлийн нэр,зэрэг, дугаар
            </th>
            <th
              rowSpan={2}
              className="border border-black px-1 py-1 font-medium"
            >
              Хэмжих нэгж
            </th>
            <th
              rowSpan={2}
              className="border border-black px-2 py-1 font-medium"
            >
              Нэг бүрийн үнэ
            </th>
            <th
              colSpan={2}
              className="border border-black px-2 py-1 font-medium"
            >
              Хүлээн авсан
            </th>
          </tr>
          <tr>
            <th className="border border-black px-1 py-1 font-medium">Тоо</th>
            <th className="border border-black px-1 py-1 font-medium">Үнэ</th>
          </tr>
        </thead>
        <tbody>
          {filled.map((row, idx) => (
            <tr key={idx}>
              <td className="border border-black px-1 py-2 text-center">
                {idx + 1}
              </td>
              <td className="border border-black px-2 py-2">
                {row?.name || ' '}
              </td>
              <td className="border border-black px-1 py-2 text-center">
                {row?.unit || ' '}
              </td>
              <td className="border border-black px-2 py-2 text-right">
                {row ? formatNumber(row.unitPrice) : ' '}
              </td>
              <td className="border border-black px-1 py-2 text-right">
                {row?.count ? fixNum(row.count, 2).toLocaleString() : ' '}
              </td>
              <td className="border border-black px-1 py-2 text-right">
                {row ? formatNumber(row.amount) : ' '}
              </td>
            </tr>
          ))}
          <tr>
            <td className="border border-black px-1 py-1.5" />
            <td className="border border-black px-2 py-1.5 font-medium">
              Дүн:
            </td>
            <td className="border border-black px-1 py-1.5 text-center">X</td>
            <td className="border border-black px-2 py-1.5 text-center">X</td>
            <td className="border border-black px-1 py-1.5 text-center">X</td>
            <td className="border border-black px-1 py-1.5 text-right font-bold">
              {formatNumber(subTotal)}
            </td>
          </tr>
          <tr>
            <td className="border border-black px-1 py-1.5 text-center">X</td>
            <td className="border border-black px-2 py-1.5 font-medium">
              НӨАТ дүн:
            </td>
            <td className="border border-black px-1 py-1.5" />
            <td className="border border-black px-2 py-1.5" />
            <td className="border border-black px-1 py-1.5" />
            <td className="border border-black px-1 py-1.5 text-right">
              {formatNumber(vatAmount)}
            </td>
          </tr>
          <tr>
            <td className="border border-black px-1 py-1.5" />
            <td className="border border-black px-2 py-1.5 font-medium">
              Нийт дүн:
            </td>
            <td className="border border-black px-1 py-1.5" />
            <td className="border border-black px-2 py-1.5" />
            <td className="border border-black px-1 py-1.5" />
            <td className="border border-black px-1 py-1.5 text-right font-bold">
              {formatNumber(total)}
            </td>
          </tr>
        </tbody>
      </table>

      <div className="mt-6 space-y-2">
        <SignLine label="Хүлээн авсан" />
        <SignLine label="Хүлээлгэн өгсөн" />
        <SignLine label="Шалгасан нягтлан бодогч" />
      </div>
    </div>
  );
};
