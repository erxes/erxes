import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { fixNum } from 'erxes-ui';
import { ITransaction } from '~/modules/transactions/types/Transaction';
import { amountToText } from './numberToWords';
import { Field, VoucherHeader } from './shared';

export const PrintBankDocument = ({
  transaction,
}: {
  transaction: ITransaction;
}) => {
  const { t } = useTranslation('accounting');

  const detail = transaction?.details?.[0];

  const amount = detail?.currencyAmount ?? detail?.amount ?? 0;
  const amountFormatted = fixNum(amount, 2).toLocaleString();
  const amountInWords = amountToText(amount);

  const payerBank = detail?.account?.extra?.bank || '';
  const debitAccount = detail?.account?.extra?.bankAccount || '';

  const receiverBank = transaction?.extraData?.bank || '';
  const creditAccount = transaction?.extraData?.bankAccount || '';

  const description = transaction?.description || '';

  const payerName =
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
        title={t('payment-order')}
        documentNo={documentNo}
        date={transactionDate}
      />

      <div className="mb-3">
        <Field label={t('payer-name')} value={payerName} />
      </div>

      <table className="w-full border-collapse border border-black/60 text-[12px]">
        <thead>
          <tr className="bg-black/6">
            <th className="border border-black/60 px-2 py-1 text-left font-medium">
              {t('parties')}
            </th>
            <th className="border border-black/60 px-2 py-1 text-left font-medium">
              {t('bank')}
            </th>
            <th className="border border-black/60 px-2 py-1 text-left font-medium">
              {t('account')}
            </th>
            <th className="border border-black/60 px-2 py-1 text-right font-medium">
              {t('amount')}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-black/60 px-2 py-1.5 font-medium">
              {t('payer')}
            </td>
            <td className="border border-black/60 px-2 py-1.5">{payerBank}</td>
            <td className="border border-black/60 px-2 py-1.5">
              {debitAccount}
            </td>
            <td className="border border-black/60 px-2 py-1.5 text-right">
              &nbsp;
            </td>
          </tr>
          <tr>
            <td className="border border-black/60 px-2 py-1.5 font-medium">
              {t('recipient')}
            </td>
            <td className="border border-black/60 px-2 py-1.5">
              {receiverBank}
            </td>
            <td className="border border-black/60 px-2 py-1.5">
              {creditAccount}
            </td>
            <td className="border border-black/60 px-2 py-1.5 text-right font-bold">
              {amountFormatted}
            </td>
          </tr>
        </tbody>
      </table>

      <div className="mt-3">
        <Field
          label={t('amount-in-words')}
          value={amountInWords}
          className="border-x border-t border-black/60"
        />
        <Field
          label={t('goods-received-or-services-completed')}
          value={transactionDate}
          className="border-x border-black/60"
        />
        <div className="flex border-x border-b border-black/60">
          <div className="w-[42%] shrink-0 bg-black/4 px-2 py-1 font-medium">
            {t('payment-purpose')}
          </div>
          <div className="min-h-16 flex-1 px-2 py-1 whitespace-pre-wrap">
            {description || ' '}
          </div>
        </div>
      </div>

      <div className="mt-12 flex justify-between text-[12px]">
        <div className="w-1/2 text-center">
          <div className="mx-auto mt-8 w-52 border-t border-black pt-1">
            {t('chief-accountant')}
          </div>
        </div>
        <div className="w-1/2 text-center">
          <div className="mx-auto mt-8 w-52 border-t border-black pt-1">
            {t('signature-seal')}
          </div>
        </div>
      </div>
    </div>
  );
};
