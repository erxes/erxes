import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { ITransaction } from '~/modules/transactions/types/Transaction';
import { formatNumber, keyRows } from './shared';

const TH = 'border border-black px-1 py-1 font-medium';
const TD = 'border border-black px-1 py-1.5';

// inv_move_1 / inv_move_2 differ only in the ministry-order note suffix.
export type InvMoveVariant = 'standard' | 'byPrice';

export const PrintInvMoveDocument = ({
  transaction,
  variant = 'standard',
}: {
  transaction: ITransaction;
  variant?: InvMoveVariant;
}) => {
  const { t } = useTranslation('accounting');
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
        <div className="font-medium">{t('accounting-form-bm3')}</div>
        <div className="text-right leading-tight">
          {t('minister-of-finance-and-economy-and-head-of-the-national')}
          <br />
          {t('head-of-the-national-statistics-office-in-2002')}
          <br />
          {t('no-171-111-dated-june-18')}
          <br />
          {t('appendix-to-the-order')}
          {variant === 'byPrice' ? t('at-selling-price') : ''}
        </div>
      </div>

      <div className="mt-3 border-b border-black pb-1 font-bold">
        {t('organization-label', { nsSeparator: false })}
      </div>

      <div className="mt-3 mb-2 text-center text-[15px] font-bold">
        {t('internal-transfer')}
      </div>

      <div className="font-bold">
        {t('date-label', { nsSeparator: false })} {date}
      </div>
      <div className="mb-2 font-bold">
        {t('description-label', { nsSeparator: false })} {description}
      </div>

      <table className="w-full border-collapse border border-black text-[11px]">
        <thead>
          <tr>
            <th className={`${TH} w-8`}>№</th>
            <th className={`${TH} px-2`}>{t('inventory-label')}</th>
            <th className={TH}>{t('unit-of-measure-label-2')}</th>
            <th className={TH}>{t('from-label')}</th>
            <th className={TH}>{t('from-account')}</th>
            <th className={TH}>{t('to')}</th>
            <th className={TH}>{t('to-account')}</th>
            <th className={TH}>{t('quantity')}</th>
            <th className={TH}>{t('unit-price-label')}</th>
            <th className={TH}>{t('price')}</th>
          </tr>
        </thead>
        <tbody>
          {keyRows(rows).map(({ key, index, row }) => (
            <tr key={key}>
              <td className={`${TD} text-center`}>{index + 1}</td>
              <td className={`${TD} px-2`}>{row?.name || ' '}</td>
              <td className={`${TD} text-center`}>{row?.unit || ' '}</td>
              <td className={TD}>{row?.from || ' '}</td>
              <td className={TD}>{row?.fromAccount || ' '}</td>
              <td className={TD}>{row?.to || ' '}</td>
              <td className={TD}>{row?.toAccount || ' '}</td>
              <td className={`${TD} text-right`}>
                {row?.count ? row.count.toLocaleString() : ' '}
              </td>
              <td className={`${TD} text-right`}>
                {row?.unitPrice ? formatNumber(row.unitPrice) : ' '}
              </td>
              <td className={`${TD} text-right`}>
                {row ? formatNumber(row.lineAmount) : ' '}
              </td>
            </tr>
          ))}
          <tr>
            <td className={TD} />
            <td className={`${TD} px-2 text-center font-medium`}>
              {t('amount')}
            </td>
            <td className={TD} colSpan={6} />
            <td className={`${TD} text-right`} />
            <td className={`${TD} text-right font-bold`}>
              {formatNumber(total)}
            </td>
          </tr>
        </tbody>
      </table>

      <div className="mt-10 space-y-3 text-[11px]">
        <div className="flex items-end justify-center gap-2">
          <span className="shrink-0">
            {t('received-by', { nsSeparator: false })}
          </span>
          <span className="inline-block w-72 border-b border-dotted border-black" />
          <span>/</span>
          <span className="inline-block w-72 border-b border-dotted border-black" />
          <span>/</span>
        </div>
        <div className="flex items-end justify-center gap-2">
          <span className="shrink-0">
            {t('handed-over-by', { nsSeparator: false })}
          </span>
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
