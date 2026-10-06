import { useTranslation } from 'react-i18next';
import { ITransaction } from '~/modules/transactions/types/Transaction';
import {
  A4Sheet,
  DiscountReceipt,
  FormHeader,
  IDiscountReceiptConfig,
  IReceiptLabels,
  SignLine,
  SimpleItemRows,
  TD,
  TH,
  TwinReceipt,
  TwinSheet,
  buildRows,
  formatNumber,
  getMeta,
  padRows,
  sumAmount,
} from './shared';

// Four Борлуулалт (sales) layouts shipped by the document config screen.
export type InvSaleVariant =
  | 'twin' // inv_sale_1 — side-by-side simple receipts
  | 'location' // inv_sale_2 — single receipt with a Байршил column
  | 'discount' // inv_sale_3 — "Худалдсан" group with a discount block
  | 'numbered'; // inv_sale_4 — "ЗАРЛАГЫН БАРИМТ №" with a "Худалдах" group

// Labels for the shared twin receipt — inv_sale_1.
const TWIN_LABELS: IReceiptLabels = {
  formCode: 'accounting-form-bm3',
  title: 'issue-voucher',
  orgLabel: 'organization-label',
  partyLabel: 'recipient-destination-label',
};

// === inv_sale_2: single receipt with an extra Байршил column.
const LocationReceipt = ({ transaction }: { transaction: ITransaction }) => {
  const { t } = useTranslation('accounting');
  const { date } = getMeta(transaction);
  const rows = buildRows(transaction);
  const filled = padRows(rows, 5);

  return (
    <A4Sheet paddingX="18mm">
      <FormHeader code="accounting-form-bm3" />
      <div className="mt-1 border-b border-black pb-1 font-bold">
        {t('organization-label', { nsSeparator: false })}
      </div>
      <div className="mt-3 mb-3 text-center text-[16px] font-bold">
        {t('issue-voucher')}
      </div>
      <div className="font-bold">
        {t('date-label', { nsSeparator: false })} {date || '20.../.../...'}
      </div>
      <div className="mt-1 font-bold">
        {t('recipient-destination-label', { nsSeparator: false })}
      </div>
      <div className="mt-1 mb-2 font-bold">
        {t('description-label', { nsSeparator: false })}
      </div>

      <table className="w-full border-collapse border border-black text-[11px]">
        <thead>
          <tr>
            <th className={`${TH} px-2`}>{t('inventory-label')}</th>
            <th className={`${TH} px-2`}>{t('location')}</th>
            <th className={TH}>{t('unit-of-measure-label-2')}</th>
            <th className={TH}>{t('quantity')}</th>
            <th className={TH}>{t('unit-price-label')}</th>
            <th className={TH}>{t('price')}</th>
          </tr>
        </thead>
        <SimpleItemRows rows={filled} total={sumAmount(rows)} withLocation />
      </table>

      <div className="mt-6 space-y-2">
        <SignLine label={t('received-label')} />
        <SignLine label={t('handed-over-label')} />
      </div>

      <div className="mt-6 flex justify-between text-[11px]">
        <div>
          <span>{t('entered-by', { nsSeparator: false })}</span>
          <span className="ml-1 inline-block w-40 border-b border-dotted border-black" />
        </div>
        <div>
          <span>{t('printed-label', { nsSeparator: false })}</span>
          <span className="ml-1 inline-block w-40 border-b border-dotted border-black" />
        </div>
      </div>
    </A4Sheet>
  );
};

// inv_sale_3 discount-receipt labels — "Худалдсан" with a payable summary.
const DISCOUNT_CONFIG = (date: string): IDiscountReceiptConfig => {
  const { t } = useTranslation('accounting');
  return {
    formCode: t('accounting-form-bm3'),
    title: t('issue-voucher'),
    showDocNo: false,
    dateText: date || t('year-month-day-label'),
    partyLabel: t('recipient-destination-label', { nsSeparator: false }),
    unitHeader: t('unit-of-measure-label'),
    priceHeaderNote: t('vat-included'),
    groupHeader: t('sold-label'),
    percentHeader: t('discount-label-2'),
    discountLabel: t('discount', { nsSeparator: false }),
    payableLabel: t('payment', { nsSeparator: false }),
    lastSignLabel: t('reviewed-by'),
    minRows: 5,
  };
};

// === inv_sale_4: numbered "ЗАРЛАГЫН БАРИМТ №" with a "Худалдах" group.
const NumberedReceipt = ({ transaction }: { transaction: ITransaction }) => {
  const { t } = useTranslation('accounting');
  const { documentNo, date } = getMeta(transaction);
  const rows = buildRows(transaction);
  const total = sumAmount(rows);
  const filled = padRows(rows, 5);

  return (
    <A4Sheet>
      <FormHeader code="accounting-form-bm-3" />
      <div className="mt-1 border-b border-black pb-1 font-bold">
        {t('organization-name-label-3', { nsSeparator: false })}
      </div>
      <div className="mt-3 mb-3 text-center text-[16px] font-bold uppercase">
        {t('issue-voucher-no')}
        {documentNo ? ` ${documentNo}` : ''}
      </div>
      <div className="font-bold">{date || t('year-month-day-label')}</div>
      <div className="mt-1 font-bold">
        {t('customer-name', { nsSeparator: false })}
      </div>
      <div className="mt-1 mb-2 font-bold">
        {t('description-label', { nsSeparator: false })}
      </div>

      <table className="w-full border-collapse border border-black text-[11px]">
        <thead>
          <tr>
            <th rowSpan={2} className={`${TH} w-8`}>
              №
            </th>
            <th rowSpan={2} className={`${TH} px-2`}>
              {t('item-description-grade-and-number')}
            </th>
            <th rowSpan={2} className={TH}>
              {t('unit-of-measure-label-2')}
            </th>
            <th colSpan={3} className={`${TH} px-2`}>
              {t('sell-label')}
            </th>
          </tr>
          <tr>
            <th className={TH}>{t('quantity')}</th>
            <th className={TH}>{t('unit-price-label')}</th>
            <th className={TH}>{t('total-amount-label')}</th>
          </tr>
        </thead>
        <tbody>
          {filled.map(({ key, index, row }) => (
            <tr key={key}>
              <td className={`${TD} py-2 text-center`}>{index + 1}</td>
              <td className={`${TD} px-2 py-2`}>{row?.name || ' '}</td>
              <td className={`${TD} py-2 text-center`}>{row?.unit || ' '}</td>
              <td className={`${TD} py-2 text-right`}>
                {row?.count ? row.count.toLocaleString() : ' '}
              </td>
              <td className={`${TD} py-2 text-right`}>
                {row ? formatNumber(row.unitPrice) : ' '}
              </td>
              <td className={`${TD} py-2 text-right`}>
                {row ? formatNumber(row.amount) : ' '}
              </td>
            </tr>
          ))}
          <tr>
            <td className={TD} />
            <td className={`${TD} px-2 font-medium`}>
              {t('amount-label', { nsSeparator: false })}
            </td>
            <td className={`${TD} text-center`}>X</td>
            <td className={`${TD} text-center`}>X</td>
            <td className={`${TD} text-center`}>X</td>
            <td className={`${TD} text-right font-bold`}>
              {formatNumber(total)}
            </td>
          </tr>
        </tbody>
      </table>

      <div className="mt-6 space-y-2">
        <SignLine label={t('received-label')} />
        <SignLine label={t('handed-over-label')} />
        <SignLine label={t('reviewed-by-accountant-label')} />
      </div>
    </A4Sheet>
  );
};

export const PrintInvSaleDocument = ({
  transaction,
  variant = 'numbered',
}: {
  transaction: ITransaction;
  variant?: InvSaleVariant;
}) => {
  switch (variant) {
    case 'twin':
      return (
        <TwinSheet>
          <TwinReceipt
            transaction={transaction}
            labels={TWIN_LABELS}
            minRows={5}
          />
          <TwinReceipt
            transaction={transaction}
            labels={TWIN_LABELS}
            minRows={5}
          />
        </TwinSheet>
      );

    case 'location':
      return <LocationReceipt transaction={transaction} />;

    case 'discount':
      return (
        <DiscountReceipt
          transaction={transaction}
          config={DISCOUNT_CONFIG(getMeta(transaction).date)}
        />
      );

    case 'numbered':
    default:
      return <NumberedReceipt transaction={transaction} />;
  }
};
