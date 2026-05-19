import { ITransaction } from '~/modules/transactions/types/Transaction';
import {
  A4Sheet,
  FormHeader,
  SignLine,
  TwinSheet,
  buildRows,
  formatNumber,
  getMeta,
  padRows,
  sumAmount,
} from './shared';

const TH = 'border border-black px-1 py-1 font-medium';
const TD = 'border border-black px-1 py-1.5';

// Four Бараа материалын орлого (inventory income) layouts.
export type InvIncomeVariant =
  | 'twin' // inv_income_1 — side-by-side simple receipts
  | 'simple' // inv_income_2 — single simple receipt
  | 'discount' // inv_income_3 — "Худалдаж авсан" group with a discount block
  | 'numbered'; // inv_income_4 — "ОРЛОГЫН БАРИМТ №" with a "Хүлээн авсан" group

// === inv_income_1: one side of the twin simple receipt.
const TwinReceipt = ({ transaction }: { transaction: ITransaction }) => {
  const rows = buildRows(transaction);
  const total = sumAmount(rows);
  const filled = padRows(rows, 2);

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
            <th className={TH}>Бараа материал</th>
            <th className={TH}>Хэмжих нэгж</th>
            <th className={TH}>Тоо</th>
            <th className={TH}>Нэгжийн үнэ</th>
            <th className={TH}>Үнэ</th>
          </tr>
        </thead>
        <tbody>
          {filled.map((row, idx) => (
            <tr key={idx}>
              <td className={TD}>{row?.name || ' '}</td>
              <td className={`${TD} text-center`}>{row?.unit || ' '}</td>
              <td className={`${TD} text-right`}>
                {row?.count ? row.count.toLocaleString() : ' '}
              </td>
              <td className={`${TD} text-right`}>
                {row ? formatNumber(row.unitPrice) : ' '}
              </td>
              <td className={`${TD} text-right`}>
                {row ? formatNumber(row.amount) : ' '}
              </td>
            </tr>
          ))}
          <tr>
            <td className={`${TD} font-medium`}>Дүн:</td>
            <td className={`${TD} text-center`}>X</td>
            <td className={`${TD} text-center`}>X</td>
            <td className={`${TD} text-center`}>X</td>
            <td className={`${TD} text-right font-bold`}>
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
  const total = sumAmount(rows);
  const filled = padRows(rows, 5);

  return (
    <A4Sheet paddingX="18mm">
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
            <th className={`${TH} px-2`}>Бараа материал</th>
            <th className={`${TH} px-2`}>Хэмжих нэгж</th>
            <th className={TH}>Тоо</th>
            <th className={`${TH} px-2`}>Нэгжийн үнэ</th>
            <th className={TH}>Үнэ</th>
          </tr>
        </thead>
        <tbody>
          {filled.map((row, idx) => (
            <tr key={idx}>
              <td className={`${TD} px-2`}>{row?.name || ' '}</td>
              <td className={`${TD} px-2 text-center`}>{row?.unit || ' '}</td>
              <td className={`${TD} text-right`}>
                {row?.count ? row.count.toLocaleString() : ' '}
              </td>
              <td className={`${TD} px-2 text-right`}>
                {row ? formatNumber(row.unitPrice) : ' '}
              </td>
              <td className={`${TD} text-right`}>
                {row ? formatNumber(row.amount) : ' '}
              </td>
            </tr>
          ))}
          <tr>
            <td className={`${TD} px-2 font-medium`}>Дүн:</td>
            <td className={`${TD} px-2 text-center`}>X</td>
            <td className={`${TD} text-center`}>X</td>
            <td className={`${TD} px-2 text-center`}>X</td>
            <td className={`${TD} text-right font-bold`}>
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
    </A4Sheet>
  );
};

// === inv_income_3: "Худалдаж авсан" grouped header with a discount block.
const DiscountReceipt = ({ transaction }: { transaction: ITransaction }) => {
  const { documentNo } = getMeta(transaction);
  const rows = buildRows(transaction);
  const total = sumAmount(rows);
  const discount = transaction?.extraData?.discount ?? 0;
  const grandTotal = total - discount;
  const filled = padRows(rows, 4);

  return (
    <A4Sheet>
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
            <th rowSpan={2} className={`${TH} px-2`}>
              Бараа материал
            </th>
            <th rowSpan={2} className={TH}>
              Хэм,нэгж
            </th>
            <th rowSpan={2} className={`${TH} px-2`}>
              Нэгж үнэ
            </th>
            <th colSpan={4} className={`${TH} px-2`}>
              Худалдаж авсан
            </th>
          </tr>
          <tr>
            <th className={TH}>Тоо</th>
            <th className={TH}>Хөн,хувь</th>
            <th className={TH}>Хөнгөлөлт</th>
            <th className={TH}>Дүн</th>
          </tr>
        </thead>
        <tbody>
          {filled.map((row, idx) => (
            <tr key={idx}>
              <td className={`${TD} px-2`}>{row?.name || ' '}</td>
              <td className={`${TD} text-center`}>{row?.unit || ' '}</td>
              <td className={`${TD} px-2 text-right`}>
                {row ? formatNumber(row.unitPrice) : ' '}
              </td>
              <td className={`${TD} text-right`}>
                {row?.count ? row.count.toLocaleString() : ' '}
              </td>
              <td className={`${TD} text-right`}>&nbsp;</td>
              <td className={`${TD} text-right`}>&nbsp;</td>
              <td className={`${TD} text-right`}>
                {row ? formatNumber(row.amount) : ' '}
              </td>
            </tr>
          ))}
          <tr>
            <td className={`${TD} px-2 font-medium`}>Дүн:</td>
            <td className={`${TD} text-center`}>X</td>
            <td className={`${TD} px-2 text-center`}>X</td>
            <td className={`${TD} text-center`}>X</td>
            <td className={`${TD} text-center`}>X</td>
            <td className={TD} />
            <td className={`${TD} text-right font-bold`}>
              {formatNumber(total)}
            </td>
          </tr>
          <tr>
            <td colSpan={6} className={`${TD} px-2 text-right font-medium`}>
              Хөнгөлөлт:
            </td>
            <td className={`${TD} text-right`}>{formatNumber(discount)}</td>
          </tr>
          <tr>
            <td colSpan={6} className={`${TD} px-2 text-right font-medium`}>
              Нийт дүн:
            </td>
            <td className={`${TD} text-right font-bold`}>
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
    </A4Sheet>
  );
};

// === inv_income_4: numbered "ОРЛОГЫН БАРИМТ №" with a "Хүлээн авсан" group.
const NumberedReceipt = ({ transaction }: { transaction: ITransaction }) => {
  const { documentNo } = getMeta(transaction);
  const rows = buildRows(transaction);
  const total = sumAmount(rows);
  const filled = padRows(rows, 5);

  return (
    <A4Sheet>
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
            <th rowSpan={2} className={`${TH} w-8`}>
              №
            </th>
            <th rowSpan={2} className={`${TH} px-2`}>
              Материалын үнэт зүйлийн нэр,зэрэг, дугаар
            </th>
            <th rowSpan={2} className={TH}>
              Хэмжих нэгж
            </th>
            <th rowSpan={2} className={`${TH} px-2`}>
              Нэг бүрийн үнэ
            </th>
            <th colSpan={2} className={`${TH} px-2`}>
              Хүлээн авсан
            </th>
          </tr>
          <tr>
            <th className={TH}>Тоо</th>
            <th className={TH}>Үнэ</th>
          </tr>
        </thead>
        <tbody>
          {filled.map((row, idx) => (
            <tr key={idx}>
              <td className={`${TD} py-2 text-center`}>{idx + 1}</td>
              <td className={`${TD} px-2 py-2`}>{row?.name || ' '}</td>
              <td className={`${TD} py-2 text-center`}>{row?.unit || ' '}</td>
              <td className={`${TD} px-2 py-2 text-right`}>
                {row ? formatNumber(row.unitPrice) : ' '}
              </td>
              <td className={`${TD} py-2 text-right`}>
                {row?.count ? row.count.toLocaleString() : ' '}
              </td>
              <td className={`${TD} py-2 text-right`}>
                {row ? formatNumber(row.amount) : ' '}
              </td>
            </tr>
          ))}
          <tr>
            <td className={TD} />
            <td className={`${TD} px-2 font-medium`}>Дүн:</td>
            <td className={`${TD} text-center`}>X</td>
            <td className={`${TD} px-2 text-center`}>X</td>
            <td className={`${TD} text-center`}>X</td>
            <td className={`${TD} text-right font-bold`}>
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
    </A4Sheet>
  );
};

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
