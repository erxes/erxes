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
  formCode: 'НХМаягт БМ3',
  title: 'issue-voucher',
  orgLabel: 'organization',
  partyLabel: 'issued-to-2',
};

// === inv_sale_2: single receipt with an extra Байршил column.
const LocationReceipt = ({ transaction }: { transaction: ITransaction }) => {
  const { t } = useTranslation('accounting');

  const { date } = getMeta(transaction);
  const rows = buildRows(transaction);
  const filled = padRows(rows, 5);

  return (
    <A4Sheet paddingX="18mm">
      <FormHeader code="НХМаягт БМ3" />
      <div className="mt-1 border-b border-black pb-1 font-bold">
        {t('organization')}
      </div>
      <div className="mt-3 mb-3 text-center text-[16px] font-bold">
        {t('issue-voucher')}
      </div>
      <div className="font-bold">
        {t('date-2')} {date || '20.../.../...'}
      </div>
      <div className="mt-1 font-bold">{t('issued-to-2')}</div>
      <div className="mt-1 mb-2 font-bold">{t('description-2')}</div>

      <table className="w-full border-collapse border border-black text-[11px]">
        <thead>
          <tr>
            <th className={`${TH} px-2`}>{t('inventory')}</th>
            <th className={`${TH} px-2`}>{t('location')}</th>
            <th className={TH}>{t('unit-of-measure')}</th>
            <th className={TH}>{t('quantity')}</th>
            <th className={TH}>{t('unit-price')}</th>
            <th className={TH}>{t('price')}</th>
          </tr>
        </thead>
        <SimpleItemRows rows={filled} total={sumAmount(rows)} withLocation />
      </table>

      <div className="mt-6 space-y-2">
        <SignLine label={t('received-by')} />
        <SignLine label={t('handed-over-by')} />
      </div>

      <div className="mt-6 flex justify-between text-[11px]">
        <div>
          <span>{t('entered-by')}</span>
          <span className="ml-1 inline-block w-40 border-b border-dotted border-black" />
        </div>
        <div>
          <span>{t('printed-by')}</span>
          <span className="ml-1 inline-block w-40 border-b border-dotted border-black" />
        </div>
      </div>
    </A4Sheet>
  );
};

// inv_sale_3 discount-receipt labels — "Худалдсан" with a payable summary.
const DISCOUNT_CONFIG = (date: string): IDiscountReceiptConfig => {
  return {
    formCode: 'НХМаягт БМ3',
    title: 'issue-voucher',
    showDocNo: false,
    dateText: date || '20-2',
    partyLabel: 'issued-to-2',
    unitHeader: 'unit-of-measure',
    priceHeaderNote: 'vat-included',
    groupHeader: 'sold',
    percentHeader: 'discount-2',
    discountLabel: 'discount-4',
    payableLabel: 'amount-payable',
    lastSignLabel: 'reviewed-by-2',
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
      <FormHeader code="НХМаягт БМ-3" />
      <div className="mt-1 border-b border-black pb-1 font-bold">
        {t('organization-name-3')}
      </div>
      <div className="mt-3 mb-3 text-center text-[16px] font-bold uppercase">
        {t('issue-voucher-no')}
        {documentNo ? ` ${documentNo}` : ''}
      </div>
      <div className="font-bold">{date || t('20-2')}</div>
      <div className="mt-1 font-bold">{t('buyer-name')}</div>
      <div className="mt-1 mb-2 font-bold">{t('description-2')}</div>

      <table className="w-full border-collapse border border-black text-[11px]">
        <thead>
          <tr>
            <th rowSpan={2} className={`${TH} w-8`}>
              №
            </th>
            <th rowSpan={2} className={`${TH} px-2`}>
              {t('item-name-grade-and-number')}
            </th>
            <th rowSpan={2} className={TH}>
              {t('unit-of-measure')}
            </th>
            <th colSpan={3} className={`${TH} px-2`}>
              {t('selling')}
            </th>
          </tr>
          <tr>
            <th className={TH}>{t('quantity')}</th>
            <th className={TH}>{t('unit-price')}</th>
            <th className={TH}>{t('total-amount')}</th>
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
            <td className={`${TD} px-2 font-medium`}>{t('amount-2')}</td>
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
        <SignLine label={t('received-by')} />
        <SignLine label={t('handed-over-by')} />
        <SignLine label={t('reviewed-by-accountant')} />
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
