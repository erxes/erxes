import { useTranslation } from 'react-i18next';
import { ITransaction } from '~/modules/transactions/types/Transaction';
import {
  A4Sheet,
  DiscountReceipt,
  FormHeader,
  IDiscountReceiptConfig,
  IReceiptLabels,
  NumberedItemRows,
  NumberedTableHead,
  NumberedTotalRow,
  SignLine,
  SimpleReceipt,
  TwinReceipt,
  TwinSheet,
  buildRows,
  getMeta,
  padRows,
  sumAmount,
} from './shared';

// Four Бараа материалын орлого (inventory income) layouts.
export type InvIncomeVariant =
  | 'twin' // inv_income_1 — side-by-side simple receipts
  | 'simple' // inv_income_2 — single simple receipt
  | 'discount' // inv_income_3 — "Худалдаж авсан" group with a discount block
  | 'numbered'; // inv_income_4 — "ОРЛОГЫН БАРИМТ №" with a "Хүлээн авсан" group

// Labels that turn the shared sale-style receipt into an income receipt.
const TWIN_LABELS: IReceiptLabels = {
  formCode: 'accounting-form-bm2',
  title: 'receipt-voucher-label',
  orgLabel: 'organization-label-2',
  partyLabel: 'sender-source-label-2',
};

const SIMPLE_LABELS: IReceiptLabels = {
  formCode: 'accounting-form-bm2',
  title: 'receipt-voucher',
  orgLabel: 'organization-label',
  partyLabel: 'sender-source-label-2',
};

// inv_income_3 discount-receipt labels — "Худалдаж авсан" with a grand total.
const DISCOUNT_CONFIG: IDiscountReceiptConfig = {
  formCode: 'accounting-form-bm3',
  title: 'receipt-voucher',
  showDocNo: true,
  dateText: 'date-year',
  partyLabel: 'sender-source-label-2',
  unitHeader: 'unit-of-measure',
  groupHeader: 'purchased',
  percentHeader: 'discount-label',
  discountLabel: 'discount-label-4',
  payableLabel: 'total-amount-label-2',
  lastSignLabel: 'reviewed-by-accountant-label',
  minRows: 4,
};

// === inv_income_4: numbered "ОРЛОГЫН БАРИМТ №" with a "Хүлээн авсан" group.
const NumberedReceipt = ({ transaction }: { transaction: ITransaction }) => {
  const { t } = useTranslation('accounting');
  const { documentNo } = getMeta(transaction);
  const rows = buildRows(transaction);
  const total = sumAmount(rows);
  const filled = padRows(rows, 5);

  return (
    <A4Sheet>
      <FormHeader code="accounting-form-bm-2" />
      <div className="mt-1 border-b border-black pb-1 font-bold">
        {t('organization-name-label-3', { nsSeparator: false })}
      </div>
      <div className="mt-3 mb-3 text-center text-[16px] font-bold uppercase">
        {t('receipt-voucher-no')}
        {documentNo ? ` ${documentNo}` : ''}
      </div>
      <div className="font-bold">{t('year-month-day-label')}</div>
      <div className="mt-1 font-bold">
        {t('supplier-name', { nsSeparator: false })}
      </div>
      <div className="mt-1 mb-2 font-bold">
        {t('description-label', { nsSeparator: false })}
      </div>

      <table className="w-full border-collapse border border-black text-[11px]">
        <NumberedTableHead />
        <tbody>
          <NumberedItemRows rows={filled} />
          <NumberedTotalRow total={total} />
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
          <TwinReceipt
            transaction={transaction}
            labels={TWIN_LABELS}
            minRows={2}
          />
          <TwinReceipt
            transaction={transaction}
            labels={TWIN_LABELS}
            minRows={2}
          />
        </TwinSheet>
      );

    case 'simple':
      return (
        <SimpleReceipt
          transaction={transaction}
          labels={SIMPLE_LABELS}
          minRows={5}
        />
      );

    case 'discount':
      return (
        <DiscountReceipt transaction={transaction} config={DISCOUNT_CONFIG} />
      );

    case 'numbered':
    default:
      return <NumberedReceipt transaction={transaction} />;
  }
};
