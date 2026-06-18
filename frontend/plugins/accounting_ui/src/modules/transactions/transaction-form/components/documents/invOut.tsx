import dayjs from 'dayjs';
import { fixNum } from 'erxes-ui';
import { ITransaction } from '~/modules/transactions/types/Transaction';
import {
  FormHeader,
  SignLine,
  buildRows,
  formatNumber,
  keyRows,
  sumAmount,
} from './shared';

const TH = 'border border-black px-1 py-1 font-medium';
const TD = 'border border-black px-1 py-2';

// === Хангамжийн материалын зарлага — one copy (printed twice per sheet).
const OutReceipt = ({ transaction }: { transaction: ITransaction }) => {
  const rows = buildRows(transaction, true);
  const total = sumAmount(rows);

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
            <th className={TH}>Бараа материал</th>
            <th className={TH}>Хэмжих нэгж</th>
            <th className={TH}>Тоо</th>
            <th className={TH}>Нэгжийн үнэ</th>
            <th className={TH}>Үнэ</th>
          </tr>
        </thead>
        <tbody>
          {keyRows(rows).map(({ key, row }) => (
            <tr key={key}>
              <td className={TD}>{row?.name || ' '}</td>
              <td className={`${TD} text-center`}>{row?.unit || ' '}</td>
              <td className={`${TD} text-right`}>
                {row?.count ? fixNum(row.count, 2).toLocaleString() : ' '}
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
