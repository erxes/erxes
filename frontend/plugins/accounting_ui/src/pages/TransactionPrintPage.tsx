import { useLocation } from 'react-router-dom';
import { useTransactionDetail } from '~/modules/transactions/transaction-form/hooks/useTransactionDetail';
import dayjs from 'dayjs';
import { AccountingLayout } from '~/modules/layout/components/Layout';
import { AccountingHeader } from '~/modules/layout/components/Header';
import { useEffect, useRef } from 'react';
// import { numberToWord } from 'erxes:master/packages/api-utils/src/numberUtils';
export const TransactionPrintPage = () => {
  const query = new URLSearchParams(useLocation().search);
  const parentId = query.get('parentId');

  const { transaction, loading, error } = useTransactionDetail({
    variables: { _id: parentId },
    skip: !parentId,
  });
  const hasPrintedRef = useRef(false);
  useEffect(() => {
    if (!loading && transaction && !hasPrintedRef.current) {
      hasPrintedRef.current = true;

      setTimeout(() => {
        window.print();
      }, 300);
    }
  }, [loading, transaction]);
  if (loading) return <div className="p-10">Ачаалж байна...</div>;
  if (error)
    return (
      <div className="p-10 text-red-500">Алдаа гарлаа: {error.message}</div>
    );
  if (!transaction) return <div className="p-10">Гүйлгээ олдсонгүй.</div>;

  return (
    <AccountingLayout>
      <AccountingHeader />
      <style>
        {`
          @page { size: A4; margin: 10mm; }
          @media print {
            body { margin: 0; }
            #print-area { visibility: visible; position: absolute; left: 0; top: 0; width: 100%; }
            body > *:not(#print-area) { visibility: hidden; }
          }
        `}
      </style>
      <PrintPart data={transaction} />
    </AccountingLayout>
  );
};

const PrintPart = ({ data }: any) => {
  const detail = data?.details?.[0];
  console.log({ data });

  const amount = detail?.currencyAmount ?? detail?.amount ?? data?.sumDt ?? '';

  const amountFormatted =
    amount !== ''
      ? Number(amount).toLocaleString(undefined, {
          minimumFractionDigits: 2,
        })
      : '';

  // const amountInWords =
  //   amount !== '' ? numberToWord(amount) : '';

  const payerBank = detail?.account?.extra?.bank || '';
  const debitAccount = detail?.account?.extra?.bankAccount || '';

  const receiverBank = data?.extraData?.bank || '';
  const creditAccount = data?.extraData?.bankAccount || '';

  const description = data?.description || '';

  const transactionDate = data?.date
    ? dayjs(data.date).format('YYYY.MM.DD')
    : '';

  return (
    <div
      id="print-area"
      className="w-[210mm] min-h-[297mm] mx-auto px-[15mm] py-[10mm] text-[12px] font-serif text-black bg-white"
    >
      <div className="text-center mb-4">
        <div className="text-[18px] font-bold tracking-wide">
          ТӨЛБӨРИЙН ДААЛГАВАР
        </div>
      </div>

      <table className="w-full text-[12px]">
        <tbody>
          <tr>
            <td className="py-1 w-[120px]">№:</td>
            <td className="py-1 w-[200px] font-bold">{data?._id}</td>
            <td className="py-1" colSpan={2}></td>
            <td className="py-1 text-right" colSpan={2}>
              {dayjs(data.date).format('YYYY.MM.DD')}
            </td>
          </tr>

          <tr>
            <td className="py-1">Төлөгчийн нэр:</td>
            <td className="py-1">
              {data.company?.name || data.customer?.primaryEmail || '-'}
            </td>
            <td className="py-1" colSpan={4}></td>
          </tr>

          <tr>
            <td className="py-1">Хүлээн авагч:</td>
            <td className="py-1"></td>
            <td className="py-1 pl-2">Данс</td>
            <td className="py-1"></td>
            <td className="py-1 pl-2" colSpan={2}>
              Дүн
            </td>
          </tr>

          <tr>
            <td className="border px-2">Төлөгчийн банк</td>
            <td className="border px-2">{payerBank}</td>
            <td className="border px-2">Дебит данс</td>
            <td className="border px-2">{debitAccount}</td>
            <td className="border px-2" colSpan={2}></td>
          </tr>
          <tr>
            <td className="border px-2">Хүлээн авагчийн банк</td>
            <td className="border px-2">{receiverBank}</td>
            <td className="border px-2">Кредит данс</td>
            <td className="border px-2">{creditAccount}</td>
            <td className="border px-2 text-right font-bold" colSpan={2}>
              {amountFormatted}
            </td>
          </tr>

          <tr>
            <td className="border px-2">Мөнгөн дүн (үсгээр)</td>
            <td className="border px-2" colSpan={3}>
              {/* Наян сая төгрөг */}
            </td>
            <td className="border px-2" colSpan={2}>
              ... хоног торгууль ... төг ... мөн
            </td>
          </tr>

          <tr>
            <td className="border px-2" colSpan={4}>
              Барааг хүлээн авсан буюу ажил гүйцэтгэсэн: {transactionDate}
            </td>
            <td className="border px-2" colSpan={2}>
              Дүн(торгуультай)
            </td>
          </tr>

          <tr>
            <td className="border px-2" colSpan={4}>
              Төлбөрийн зориулалт:
            </td>
            <td className="border px-2">Гүйлгээний утга</td>
            <td className="border px-2"></td>
          </tr>

          <tr>
            <td className="border px-2" colSpan={4} rowSpan={4}>
              {description}
            </td>
            <td className="border px-2">Төлбөрийн зориулалт</td>
            <td className="border px-2"></td>
          </tr>

          <tr>
            <td className="border px-2">Төлөх</td>
            <td className="border px-2"></td>
          </tr>

          <tr>
            <td className="border px-2">Төлбөрийн ээлж</td>
            <td className="border px-2"></td>
          </tr>
        </tbody>
      </table>

      <div className="flex justify-between mt-10 text-[12px]">
        <div className="w-1/2 text-center">
          <div className="mb-10">Ерөнхий нягтлан бодогч</div>
          <div className="border-t border-black w-48 mx-auto"></div>
        </div>

        <div className="w-1/2 text-center">
          <div className="mb-10">Гарын үсэг / Тамга</div>
          <div className="border-t border-black w-48 mx-auto"></div>
        </div>
      </div>
    </div>
  );
};
