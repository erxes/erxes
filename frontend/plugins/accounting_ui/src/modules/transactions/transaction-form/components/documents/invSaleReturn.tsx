import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { ITransaction } from '~/modules/transactions/types/Transaction';
import {
  A4Sheet,
  FormHeader,
  NumberedItemRows,
  NumberedTableHead,
  NumberedTotalRow,
  SignLine,
  TD,
  buildRows,
  formatNumber,
  padRows,
  sumAmount,
} from './shared';

export const PrintInvSaleReturnDocument = ({
  transaction,
}: {
  transaction: ITransaction;
}) => {
  const { t } = useTranslation('accounting');

  const rows = buildRows(transaction, true);
  const subTotal = sumAmount(rows);
  const vatAmount = transaction?.vatAmount ?? 0;
  const total = subTotal + vatAmount;
  const filled = padRows(rows, 5);

  const documentNo = transaction?.number || transaction?.ptrNumber || '';
  const date = transaction?.date ? dayjs(transaction.date) : null;
  const dateText = date
    ? t('document-date', {
        year: date.year(),
        month: date.month() + 1,
        day: date.date(),
      })
    : t('20-2');
  const description = transaction?.description || '';
  const supplier =
    transaction.customer?.firstName || transaction.customer?.code || '';

  return (
    <A4Sheet>
      <FormHeader code="НХМаягт БМ-2" />
      <div className="mt-1 border-b border-black pb-1 font-bold">
        {t('organization-name-3')}{' '}
        <span className="font-normal">{transaction?.branch?.title || ''}</span>
      </div>

      <div className="mt-3 mb-3 text-center text-[16px] font-bold uppercase">
        {t('receipt-voucher-no')}{' '}
        <span className="underline">{documentNo || ' '}</span>
      </div>

      <div className="font-bold">{dateText}</div>
      <div className="mt-1 font-bold">
        {t('supplier-name')} <span className="font-normal">{supplier}</span>
      </div>
      <div className="mt-1 mb-2 font-bold">
        {t('description-2')} <span className="font-normal">{description}</span>
      </div>

      <table className="w-full border-collapse border border-black text-[11px]">
        <NumberedTableHead />
        <tbody>
          <NumberedItemRows rows={filled} />
          <NumberedTotalRow total={subTotal} />
          <tr>
            <td className={`${TD} text-center`}>X</td>
            <td className={`${TD} px-2 font-medium`}>{t('vat-amount')}</td>
            <td className={TD} />
            <td className={`${TD} px-2`} />
            <td className={TD} />
            <td className={`${TD} text-right`}>{formatNumber(vatAmount)}</td>
          </tr>
          <tr>
            <td className={TD} />
            <td className={`${TD} px-2 font-medium`}>{t('total-amount-2')}</td>
            <td className={TD} />
            <td className={`${TD} px-2`} />
            <td className={TD} />
            <td className={`${TD} text-right font-bold`}>
              {formatNumber(total)}
            </td>
          </tr>
        </tbody>
      </table>

      <div className="mt-6 space-y-2">
        <SignLine label={t('received-by')} />
        <SignLine label={t('handed-over-by')} />
        <SignLine label={t('reviewed-by-accountant')} />
      </div>
    </A4Sheet>
  );
};
