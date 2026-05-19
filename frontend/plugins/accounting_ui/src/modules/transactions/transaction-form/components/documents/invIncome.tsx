import dayjs from 'dayjs';
import { fixNum } from 'erxes-ui';
import { ITransaction } from '~/modules/transactions/types/Transaction';

const formatNumber = (value: number) => fixNum(value, 2).toLocaleString();

// Four Бараа материалын орлого (inventory income) layouts.
export type InvIncomeVariant =
  | 'twin' // inv_income_1 — side-by-side simple receipts
  | 'simple' // inv_income_2 — single simple receipt
  | 'discount' // inv_income_3 — "Худалдаж авсан" group with a discount block
  | 'numbered'; // inv_income_4 — "ОРЛОГЫН БАРИМТ №" with a "Хүлээн авсан" group

interface IIncomeRow {
  name: string;
  unit: string;
  count: number;
  unitPrice: number;
  amount: number;
}

const buildRows = (transaction: ITransaction): IIncomeRow[] =>
  (transaction?.details || []).map((d) => {
    const count = d.count ?? 0;
    const amount = d.amount ?? count * (d.unitPrice ?? 0);
    const unitPrice = d.unitPrice ?? (count > 0 ? amount / count : amount);

    return {
      name: d.product?.name || d.account?.name || '',
      unit: d.product?.uom || '',
      count,
      unitPrice,
      amount,
    };
  });

const getMeta = (transaction: ITransaction) => ({
  documentNo: transaction?.number || transaction?.ptrNumber || '',
  date: transaction?.date
    ? dayjs(transaction.date).format('YYYY.MM.DD')
    : '',
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

// === inv_income_1: one side of the twin simple receipt.
const TwinReceipt = ({ transaction }: { transaction: ITransaction }) => {
  const rows = buildRows(transaction);
  const total = rows.reduce((sum, r) => sum + r.amount, 0);
  const filled = [...rows, ...Array(Math.max(0, 2 - rows.length)).fill(null)];

  return (
    <div className="flex-1">
      <FormHeader code="НХМаягт БМ2" />
      <div className="mt-1 border-b border-black pb-1 font-bold">
        Байгууллага: ..............
      </div>
      <div className="mt-2 mb-2 text-center text-[15px] font-bold">
        Орлогын баримт ...
      </div>
      <div className="text-[11px] font-bold">Огноо: 20.../.../...</div>
      <div className="mt-1 text-[11px] font-bold">Хэнээс(хаанаас):</div>
      <div className="mt-1 mb-2 text-[11px] font-bold">Утга:</div>

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
          {filled.map((row, idx) => (
            <tr key={idx}>
              <td className="border border-black px-1 py-1.5">
                {row?.name || ' '}
              </td>
              <td className="border border-black px-1 py-1.5 text-center">
                {row?.unit || ' '}
              </td>
              <td className="border border-black px-1 py-1.5 text-right">
                {row?.count ? row.count.toLocaleString() : ' '}
              </td>
              <td className="border border-black px-1 py-1.5 text-right">
                {row ? formatNumber(row.unitPrice) : ' '}
              </td>
              <td className="border border-black px-1 py-1.5 text-right">
                {row ? formatNumber(row.amount) : ' '}
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

      <div className="mt-4 space-y-2">
        <SignLine label="Хүлээн авсан" />
        <SignLine label="Хүлээлгэн өгсөн" />
      </div>
    </div>
  );
};

// === inv_income_2: single simple receipt.
const SimpleReceipt = ({ transaction }: { transaction: ITransaction }) => {
  const rows = buildRows(transaction);
  const total = rows.reduce((sum, r) => sum + r.amount, 0);
  const filled = [...rows, ...Array(Math.max(0, 5 - rows.length)).fill(null)];

  return (
    <div
      id="print-area"
      className="w-[210mm] min-h-[297mm] bg-white px-[18mm] py-[14mm] font-serif text-[12px] leading-snug text-black shadow-sidebar-inset"
    >
      <FormHeader code="НХМаягт БМ2" />
      <div className="mt-1 border-b border-black pb-1 font-bold">
        Байгууллага:
      </div>
      <div className="mt-3 mb-3 text-center text-[16px] font-bold">
        Орлогын баримт
      </div>
      <div className="font-bold">Огноо: 20.../.../...</div>
      <div className="mt-1 font-bold">Хэнээс(хаанаас):</div>
      <div className="mt-1 mb-2 font-bold">Утга:</div>

      <table className="w-full border-collapse border border-black text-[11px]">
        <thead>
          <tr>
            <th className="border border-black px-2 py-1 font-medium">
              Бараа материал
            </th>
            <th className="border border-black px-2 py-1 font-medium">
              Хэмжих нэгж
            </th>
            <th className="border border-black px-1 py-1 font-medium">Тоо</th>
            <th className="border border-black px-2 py-1 font-medium">
              Нэгжийн үнэ
            </th>
            <th className="border border-black px-1 py-1 font-medium">Үнэ</th>
          </tr>
        </thead>
        <tbody>
          {filled.map((row, idx) => (
            <tr key={idx}>
              <td className="border border-black px-2 py-1.5">
                {row?.name || ' '}
              </td>
              <td className="border border-black px-2 py-1.5 text-center">
                {row?.unit || ' '}
              </td>
              <td className="border border-black px-1 py-1.5 text-right">
                {row?.count ? row.count.toLocaleString() : ' '}
              </td>
              <td className="border border-black px-2 py-1.5 text-right">
                {row ? formatNumber(row.unitPrice) : ' '}
              </td>
              <td className="border border-black px-1 py-1.5 text-right">
                {row ? formatNumber(row.amount) : ' '}
              </td>
            </tr>
          ))}
          <tr>
            <td className="border border-black px-2 py-1.5 font-medium">
              Дүн:
            </td>
            <td className="border border-black px-2 py-1.5 text-center">X</td>
            <td className="border border-black px-1 py-1.5 text-center">X</td>
            <td className="border border-black px-2 py-1.5 text-center">X</td>
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

// === inv_income_3: "Худалдаж авсан" grouped header with a discount block.
const DiscountReceipt = ({ transaction }: { transaction: ITransaction }) => {
  const { documentNo } = getMeta(transaction);
  const rows = buildRows(transaction);
  const total = rows.reduce((sum, r) => sum + r.amount, 0);
  const discount = transaction?.extraData?.discount ?? 0;
  const grandTotal = total - discount;
  const filled = [...rows, ...Array(Math.max(0, 4 - rows.length)).fill(null)];

  return (
    <div
      id="print-area"
      className="w-[210mm] min-h-[297mm] bg-white px-[16mm] py-[14mm] font-serif text-[12px] leading-snug text-black shadow-sidebar-inset"
    >
      <FormHeader code="НХМаягт БМ3" />
      <div className="mt-1 border-b border-black pb-1 font-bold">
        Байгууллага:
      </div>
      <div className="mt-3 mb-3 text-center text-[16px] font-bold">
        Орлогын баримт №{documentNo ? ` ${documentNo}` : ''}
      </div>
      <div className="font-bold">Огноо: 20.../.../...</div>
      <div className="mt-1 font-bold">Хэнээс(хаанаас):</div>
      <div className="mt-1 mb-2 font-bold">Утга:</div>

      <table className="w-full border-collapse border border-black text-[11px]">
        <thead>
          <tr>
            <th
              rowSpan={2}
              className="border border-black px-2 py-1 font-medium"
            >
              Бараа материал
            </th>
            <th
              rowSpan={2}
              className="border border-black px-1 py-1 font-medium"
            >
              Хэм,нэгж
            </th>
            <th
              rowSpan={2}
              className="border border-black px-2 py-1 font-medium"
            >
              Нэгж үнэ
            </th>
            <th
              colSpan={4}
              className="border border-black px-2 py-1 font-medium"
            >
              Худалдаж авсан
            </th>
          </tr>
          <tr>
            <th className="border border-black px-1 py-1 font-medium">Тоо</th>
            <th className="border border-black px-1 py-1 font-medium">
              Хөн,хувь
            </th>
            <th className="border border-black px-1 py-1 font-medium">
              Хөнгөлөлт
            </th>
            <th className="border border-black px-1 py-1 font-medium">Дүн</th>
          </tr>
        </thead>
        <tbody>
          {filled.map((row, idx) => (
            <tr key={idx}>
              <td className="border border-black px-2 py-1.5">
                {row?.name || ' '}
              </td>
              <td className="border border-black px-1 py-1.5 text-center">
                {row?.unit || ' '}
              </td>
              <td className="border border-black px-2 py-1.5 text-right">
                {row ? formatNumber(row.unitPrice) : ' '}
              </td>
              <td className="border border-black px-1 py-1.5 text-right">
                {row?.count ? row.count.toLocaleString() : ' '}
              </td>
              <td className="border border-black px-1 py-1.5 text-right">
                &nbsp;
              </td>
              <td className="border border-black px-1 py-1.5 text-right">
                &nbsp;
              </td>
              <td className="border border-black px-1 py-1.5 text-right">
                {row ? formatNumber(row.amount) : ' '}
              </td>
            </tr>
          ))}
          <tr>
            <td className="border border-black px-2 py-1.5 font-medium">
              Дүн:
            </td>
            <td className="border border-black px-1 py-1.5 text-center">X</td>
            <td className="border border-black px-2 py-1.5 text-center">X</td>
            <td className="border border-black px-1 py-1.5 text-center">X</td>
            <td className="border border-black px-1 py-1.5 text-center">X</td>
            <td className="border border-black px-1 py-1.5" />
            <td className="border border-black px-1 py-1.5 text-right font-bold">
              {formatNumber(total)}
            </td>
          </tr>
          <tr>
            <td
              colSpan={6}
              className="border border-black px-2 py-1.5 text-right font-medium"
            >
              Хөнгөлөлт:
            </td>
            <td className="border border-black px-1 py-1.5 text-right">
              {formatNumber(discount)}
            </td>
          </tr>
          <tr>
            <td
              colSpan={6}
              className="border border-black px-2 py-1.5 text-right font-medium"
            >
              Нийт дүн:
            </td>
            <td className="border border-black px-1 py-1.5 text-right font-bold">
              {formatNumber(grandTotal)}
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

// === inv_income_4: numbered "ОРЛОГЫН БАРИМТ №" with a "Хүлээн авсан" group.
const NumberedReceipt = ({ transaction }: { transaction: ITransaction }) => {
  const { documentNo } = getMeta(transaction);
  const rows = buildRows(transaction);
  const total = rows.reduce((sum, r) => sum + r.amount, 0);
  const filled = [...rows, ...Array(Math.max(0, 5 - rows.length)).fill(null)];

  return (
    <div
      id="print-area"
      className="w-[210mm] min-h-[297mm] bg-white px-[16mm] py-[14mm] font-serif text-[12px] leading-snug text-black shadow-sidebar-inset"
    >
      <FormHeader code="НХМаягт БМ-2" />
      <div className="mt-1 border-b border-black pb-1 font-bold">
        Байгууллагын нэр:
      </div>
      <div className="mt-3 mb-3 text-center text-[16px] font-bold uppercase">
        Орлогын баримт №{documentNo ? ` ${documentNo}` : ''}
      </div>
      <div className="font-bold">20... он ... сар ... өдөр</div>
      <div className="mt-1 font-bold">Бэлтгэн нийлүүлэгчийн нэр:</div>
      <div className="mt-1 mb-2 font-bold">Утга:</div>

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
                {row?.count ? row.count.toLocaleString() : ' '}
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

// Twin-layout wrapper for inv_income_1 (two receipts per landscape sheet).
const TwinSheet = ({ children }: { children: React.ReactNode }) => (
  <div
    id="print-area"
    className="w-[297mm] min-h-[210mm] bg-white px-[14mm] py-[14mm] font-serif text-black shadow-sidebar-inset"
  >
    <div className="flex gap-8">{children}</div>
  </div>
);

export const PrintInvIncomeDocument = ({
  transaction,
  variant = 'numbered',
}: {
  transaction: ITransaction;
  variant?: InvIncomeVariant;
}) => {
  switch (variant) {
    case 'twin':
      return (
        <TwinSheet>
          <TwinReceipt transaction={transaction} />
          <TwinReceipt transaction={transaction} />
        </TwinSheet>
      );

    case 'simple':
      return <SimpleReceipt transaction={transaction} />;

    case 'discount':
      return <DiscountReceipt transaction={transaction} />;

    case 'numbered':
    default:
      return <NumberedReceipt transaction={transaction} />;
  }
};
