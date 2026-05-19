import dayjs from 'dayjs';
import { fixNum } from 'erxes-ui';
import { ITransaction } from '~/modules/transactions/types/Transaction';

const formatNumber = (value: number) => fixNum(value, 2).toLocaleString();

interface IOutRow {
  name: string;
  unit: string;
  count: number;
  unitPrice: number;
  amount: number;
}

const buildRows = (transaction: ITransaction): IOutRow[] =>
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

// One signature line, e.g. "Олгосон: ......./......./".
const SignLine = ({ label, value }: { label: string; value?: string }) => (
  <div className="flex items-end gap-2 text-[11px]">
    <span className="shrink-0">
      {label}: {value || ''}
    </span>
    <span className="inline-block flex-1 border-b border-dotted border-black" />
    <span>/</span>
    <span className="inline-block w-48 border-b border-dotted border-black" />
    <span>/</span>
  </div>
);

// === Хангамжийн материалын зарлага — one copy (printed twice per sheet).
const OutReceipt = ({ transaction }: { transaction: ITransaction }) => {
  const rows = buildRows(transaction);
  const total = rows.reduce((sum, r) => sum + r.amount, 0);

  const documentNo = transaction?.number || transaction?.ptrNumber || '';
  const date = transaction?.date
    ? dayjs(transaction.date).format('YYYY/MM/DD')
    : '';
  const description = transaction?.description || '';
  const recipient =
    transaction.customer?.firstName || transaction.customer?.code || '';

  return (
    <div className="flex-1">
      <FormHeader code="НМХмаяг МХ1" />
      <div className="mt-1 font-bold">
        Байгууллага:{' '}
        <span className="font-normal">{transaction?.branch?.title || ''}</span>
      </div>

      <div className="mt-2 mb-2 text-center text-[14px] font-bold leading-tight">
        Хангамжийн материалын зарлага,
        <br />
        баримт: <span className="underline">{documentNo || ' '}</span>
      </div>

      <div className="text-[11px] font-bold">
        Огноо: <span className="font-normal">{date}</span>
      </div>
      <div className="mt-1 text-[11px] font-bold">
        Хэнд(хаана): <span className="font-normal">{recipient}</span>
      </div>
      <div className="mt-1 mb-2 text-[11px] font-bold">
        Утга: <span className="font-normal">{description}</span>
      </div>

      <table className="w-full border-collapse border border-black text-[11px]">
        <thead>
          <tr>
            <th className="border border-black px-1 py-1 font-medium">
              Бараа материал
            </th>
            <th className="border border-black px-1 py-1 font-medium">
              Хэмжих нэгж
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
              <td className="border border-black px-1 py-2">
                {row.name || ' '}
              </td>
              <td className="border border-black px-1 py-2 text-center">
                {row.unit || ' '}
              </td>
              <td className="border border-black px-1 py-2 text-right">
                {row.count ? fixNum(row.count, 2).toLocaleString() : ' '}
              </td>
              <td className="border border-black px-1 py-2 text-right">
                {formatNumber(row.unitPrice)}
              </td>
              <td className="border border-black px-1 py-2 text-right">
                {formatNumber(row.amount)}
              </td>
            </tr>
          ))}
          <tr>
            <td className="border border-black px-1 py-1.5 font-medium">
              Дүн:
            </td>
            <td className="border border-black px-1 py-1.5 text-center">X</td>
            <td className="border border-black px-1 py-1.5 text-center">X</td>
            <td className="border border-black px-1 py-1.5 text-center">X</td>
            <td className="border border-black px-1 py-1.5 text-right font-bold">
              {formatNumber(total)}
            </td>
          </tr>
        </tbody>
      </table>

      <div className="mt-4 space-y-2.5">
        <SignLine label="Зөвшөөрсөн" />
        <SignLine label="Олгосон" />
        <SignLine label="Хүлээн авсан" />
        <SignLine label="Шаардах бичсэн" />
        <SignLine label="Хэвлэсэн" />
      </div>
    </div>
  );
};

export const PrintInvOutDocument = ({
  transaction,
}: {
  transaction: ITransaction;
}) => (
  <div
    id="print-area"
    className="w-[297mm] min-h-[210mm] bg-white px-[14mm] py-[14mm] font-serif text-black shadow-sidebar-inset"
  >
    <div className="flex gap-8">
      <OutReceipt transaction={transaction} />
      <OutReceipt transaction={transaction} />
    </div>
  </div>
);
