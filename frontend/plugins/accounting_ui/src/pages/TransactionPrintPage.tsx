import { useLocation } from 'react-router-dom';
import { useTransactionDetail } from '~/modules/transactions/transaction-form/hooks/useTransactionDetail';
import dayjs from 'dayjs';
import { AccountingLayout } from '~/modules/layout/components/Layout';
import { AccountingHeader } from '~/modules/layout/components/Header';
import { useEffect, useRef } from 'react';
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
  const firstDetail = data.details?.[0];

  const displayAmount =
    firstDetail?.currencyAmount || firstDetail?.amount || data.sumDt || 0;

  return (
    <div
      id="print-area"
      className="w-[210mm] min-h-[297mm] mx-auto px-8 py-10 text-[12px] font-serif text-black bg-white"
    >
      {/* TITLE */}
      <div className="text-center mb-6">
        <div className="text-[16px] font-bold uppercase tracking-widest">
          Төлбөрийн даалгавар
        </div>
        <div className="text-[11px] mt-1">(Bank Payment Order)</div>
      </div>

      {/* META */}
      <div className="flex justify-between mb-4">
        <div>
          №: <span className="font-bold">{data.number}</span>
        </div>
        <div>
          Огноо:{' '}
          <span className="font-bold">
            {data.date ? dayjs(data.date).format('YYYY/MM/DD') : '____/__/__'}
          </span>
        </div>
      </div>

      {/* TABLE */}
      <table className="w-full border-collapse border border-black">
        <tbody>
          {/* NAMES */}
          <tr>
            <td className="border border-black p-2 w-1/2 align-top">
              <div className="text-[10px] uppercase">Төлөгчийн нэр</div>
              <div className="mt-1 font-medium">{`-Компанийн нэр /orgName/`}</div>
            </td>
            <td className="border border-black p-2 w-1/2 align-top">
              <div className="text-[10px] uppercase">Хүлээн авагчийн нэр</div>
              <div className="mt-1 font-medium">
                {data.customer?.primaryEmail || '—'}
              </div>
            </td>
          </tr>

          {/* BANKS */}
          <tr>
            <td className="border border-black p-2">
              <div className="text-[10px] uppercase">Төлөгчийн банк</div>
              <div className="mt-1">
                {firstDetail?.account?.extra?.bank || '—'}
              </div>
            </td>
            <td className="border border-black p-2">
              <div className="text-[10px] uppercase">Хүлээн авагчийн банк</div>
              <div className="mt-1">{data.extraData?.bank || '—'}</div>
            </td>
          </tr>

          {/* ACCOUNTS */}
          <tr>
            <td className="border border-black p-2">
              <div className="text-[10px] uppercase">Дебит данс</div>
              <div className="mt-1 font-mono font-bold">
                {firstDetail?.account?.extra?.bankAccount ||
                  firstDetail?.account?.code}
              </div>
            </td>
            <td className="border border-black p-2">
              <div className="text-[10px] uppercase">Кредит данс</div>
              <div className="mt-1 font-mono font-bold">
                {data.extraData?.bankAccount || '—'}
              </div>
            </td>
          </tr>

          {/* AMOUNT IN WORDS */}
          <tr>
            <td colSpan={2} className="border border-black p-3 h-[60px]">
              <div className="text-[10px] uppercase">Мөнгөн дүн (үсгээр)</div>
              <div className="mt-2 italic">
                {displayAmount > 0
                  ? `${displayAmount.toLocaleString()} төгрөг`
                  : '........................................................'}
              </div>
            </td>
          </tr>

          {/* AMOUNT */}
          <tr>
            <td className="border border-black p-2">
              <div className="text-[10px] uppercase">Дүн</div>
              <div className="mt-1 text-[14px] font-bold">
                {displayAmount.toLocaleString()}{' '}
                {firstDetail?.account?.currency || 'MNT'}
              </div>
            </td>
            <td className="border border-black p-2 text-center">
              <div className="text-[10px] uppercase">Гүйлгээний төрөл</div>
              <div className="mt-2 font-medium">{data.journal || 'Банк'}</div>
            </td>
          </tr>

          {/* DESCRIPTION */}
          <tr>
            <td
              colSpan={2}
              className="border border-black p-3 h-[90px] align-top"
            >
              <div className="text-[10px] uppercase">Төлбөрийн зориулалт</div>
              <div className="mt-2">{data.description || '—'}</div>
            </td>
          </tr>

          {/* SIGNATURES */}
          <tr className="h-[120px]">
            <td className="border border-black p-4 text-center align-bottom">
              <div className="text-[10px] uppercase mb-12">
                Төлөгчийн гарын үсэг
              </div>
              <div className="border-t border-black w-40 mx-auto"></div>
            </td>
            <td className="border border-black p-4 text-center align-bottom">
              <div className="text-[10px] uppercase mb-12">
                Хүлээн авагчийн тамга
              </div>
              <div className="border-t border-black w-40 mx-auto"></div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
