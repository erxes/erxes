import { DealPointPaymentLimit } from '@/deals/cards/components/detail/product/components/DealPointPaymentLimit';
import type { PayInfo } from '@/deals/cards/components/detail/product/utils/updatePayInfoForScore';
import { IPaymentsData } from '@/deals/types/deals';
import { readDealPayment } from '@/deals/utils/dealJson';
import type { PaymentConfigItem } from '@/payments';
import { IconCircleCheck, IconKey, IconLock } from '@tabler/icons-react';
import {
  Button,
  CurrencyCode,
  CurrencyField,
  cn,
  Dialog,
  Input,
  Sheet,
} from 'erxes-ui';
import { type ChangeEvent, type KeyboardEvent, type MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';

type PaymentConfig = {
  require?: string;
  skipEbarimt?: boolean;
  mustCustomer?: boolean;
  notSplit?: boolean;
  preTax?: boolean;
};

type TAmounts = { [currency: string]: number };

export type TUpdatePayment = (
  type: string,
  field: 'amount' | 'currency',
  value: number | string,
) => void;

export type TFillPayment = (paymentType: string, maxVal?: number) => void;

const PAYMENT_ROW_CLASS_NAME =
  'grid gap-3 py-3 @lg:grid-cols-[minmax(8rem,1fr)_minmax(10rem,1fr)_minmax(8rem,1fr)] @lg:items-center';

const PAYMENT_LABEL_CLASS_NAME =
  'text-xs font-medium uppercase tracking-wide text-muted-foreground';

export const parsePaymentConfig = (config: unknown): PaymentConfig => {
  if (!config) {
    return {};
  }

  let parsedConfig: unknown = config;

  if (typeof config === 'string') {
    try {
      parsedConfig = JSON.parse(config) as unknown;
    } catch {
      return {};
    }
  }

  if (typeof parsedConfig !== 'object' || parsedConfig === null) {
    return {};
  }

  const configRecord = parsedConfig as Record<string, unknown>;

  return {
    require:
      typeof configRecord.require === 'string'
        ? configRecord.require
        : undefined,
    skipEbarimt:
      typeof configRecord.skipEbarimt === 'boolean'
        ? configRecord.skipEbarimt
        : undefined,
    mustCustomer:
      typeof configRecord.mustCustomer === 'boolean'
        ? configRecord.mustCustomer
        : undefined,
    notSplit:
      typeof configRecord.notSplit === 'boolean'
        ? configRecord.notSplit
        : undefined,
    preTax:
      typeof configRecord.preTax === 'boolean'
        ? configRecord.preTax
        : undefined,
  };
};

const formatNumber = (value: number | string) => {
  if (value === '' || value === null || value === undefined) return '';
  const num =
    typeof value === 'number' ? value : Number(value.replace(/,/g, ''));

  if (Number.isNaN(num)) return '';
  return num.toLocaleString();
};

const parseNumber = (value: string) => Number(value.replace(/,/g, '')) || 0;

const renderAmount = (amount: number, currency: string) => {
  if (amount < 0) {
    return (
      <span className="text-destructive">
        {amount.toLocaleString()} {currency}
      </span>
    );
  }
  return (
    <span>
      {amount.toLocaleString()} {currency}
    </span>
  );
};

const renderTotals = (amounts: TAmounts, defaultCurrency: string) => {
  const entries = Object.entries(amounts).filter(([, val]) => val !== 0);
  if (entries.length === 0) {
    return <span>0 {defaultCurrency}</span>;
  }
  return entries.map(([currency, amount]) => (
    <div key={currency}>{renderAmount(amount, currency)}</div>
  ));
};

const getPaymentCurrency = (
  paymentsData: IPaymentsData,
  type: string,
  defaultCurrency: string,
) =>
  (readDealPayment(paymentsData, type)?.currency as CurrencyCode) ||
  (defaultCurrency as CurrencyCode);

export const PaymentTotals = ({
  total,
  changeAmounts,
  defaultCurrency,
}: {
  total: TAmounts;
  changeAmounts: TAmounts;
  defaultCurrency: string;
}) => {
  const { t } = useTranslation('sales');
  const hasPositive = Object.values(changeAmounts).some((amount) => amount > 0);
  const hasNegative = Object.values(changeAmounts).some((amount) => amount < 0);

  return (
    <div className="grid grid-cols-2 border-y bg-muted/15">
      <div className="flex flex-col items-center px-4 py-5">
        <span className={PAYMENT_LABEL_CLASS_NAME}>{t('total')}</span>
        <div className="mt-1 text-lg font-semibold tabular-nums">
          {renderTotals(total, defaultCurrency)}
        </div>
      </div>
      <div className="flex flex-col items-center border-l px-4 py-5">
        <span className={PAYMENT_LABEL_CLASS_NAME}>{t('change')}</span>
        <div
          className={cn(
            'mt-1 flex text-lg font-semibold tabular-nums',
            hasPositive && 'text-success',
            !hasPositive && hasNegative && 'text-destructive',
          )}
        >
          {hasPositive && '+'}
          {renderTotals(changeAmounts, defaultCurrency)}
        </div>
      </div>
    </div>
  );
};

export const CashPaymentRow = ({
  paymentsData,
  defaultCurrency,
  updatePayment,
  fillRemaining,
  fillRemainingIfEmpty,
}: {
  paymentsData: IPaymentsData;
  defaultCurrency: string;
  updatePayment: TUpdatePayment;
  fillRemaining: TFillPayment;
  fillRemainingIfEmpty: TFillPayment;
}) => {
  const { t } = useTranslation('sales');

  return (
    <div className={PAYMENT_ROW_CLASS_NAME}>
      <p className={PAYMENT_LABEL_CLASS_NAME}>{t('cash')}</p>
      <div className="flex items-center">
        <Input
          type="text"
          inputMode="numeric"
          value={formatNumber(
            readDealPayment(paymentsData, 'cash')?.amount ?? '',
          )}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            updatePayment('cash', 'amount', parseNumber(e.target.value))
          }
          onClick={() => fillRemainingIfEmpty('cash')}
          className="font-medium tabular-nums"
          placeholder={t('type-amount')}
        />
      </div>
      <div className="flex items-center">
        <CurrencyField.SelectCurrency
          value={getPaymentCurrency(paymentsData, 'cash', defaultCurrency)}
          onChange={(val: string) => updatePayment('cash', 'currency', val)}
          variant="ghost"
          className="w-full justify-end"
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => fillRemaining('cash')}
        >
          <IconCircleCheck className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

const MobileInvoiceContent = ({
  amount,
  currency,
  generating,
  invoiceUrl,
}: {
  amount: number;
  currency: string;
  generating: boolean;
  invoiceUrl: string;
}) => {
  const { t } = useTranslation('sales');

  return (
    <>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{t('amount')}</span>
        <span className="font-medium">
          {formatNumber(amount)} {currency}
        </span>
      </div>
      {generating && (
        <div className="flex h-96 items-center justify-center rounded-md border text-sm text-muted-foreground">
          {t('generating-payment')}
        </div>
      )}
      {!generating && invoiceUrl && (
        <>
          <Input readOnly value={invoiceUrl} className="font-mono text-xs" />
          <iframe
            title="QPay payment"
            src={invoiceUrl}
            className="h-[70vh] w-full rounded-md border"
          />
        </>
      )}
      {!generating && !invoiceUrl && (
        <div className="flex h-96 items-center justify-center rounded-md border text-sm text-muted-foreground">
          {t('payment-response')}
        </div>
      )}
    </>
  );
};

const MobileInvoiceSheet = ({
  open,
  onOpenChange,
  onCreate,
  amount,
  currency,
  generating,
  invoiceUrl,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (event?: MouseEvent<HTMLButtonElement>) => void;
  amount: number;
  currency: string;
  generating: boolean;
  invoiceUrl: string;
}) => {
  const { t } = useTranslation('sales');

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <Sheet.Trigger asChild>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCreate}
          disabled={generating}
        >
          QPay
        </Button>
      </Sheet.Trigger>
      <Sheet.View className="p-0 sm:max-w-xl">
        <Sheet.Header className="border-b">
          <Sheet.Title>{t('qpay-payment')}</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="flex flex-col gap-3 p-4">
          <MobileInvoiceContent
            amount={amount}
            currency={currency}
            generating={generating}
            invoiceUrl={invoiceUrl}
          />
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
};

export const MobilePaymentRow = ({
  amount,
  remainingAmount,
  currency,
  onAmountChange,
  onFill,
  onFillIfEmpty,
  invoiceOpen,
  onInvoiceOpenChange,
  onCreateInvoice,
  generatingInvoice,
  invoiceUrl,
}: {
  amount: number;
  remainingAmount: number;
  currency: string;
  onAmountChange: (amount: number) => void;
  onFill: () => void;
  onFillIfEmpty: () => void;
  invoiceOpen: boolean;
  onInvoiceOpenChange: (open: boolean) => void;
  onCreateInvoice: (event?: MouseEvent<HTMLButtonElement>) => void;
  generatingInvoice: boolean;
  invoiceUrl: string;
}) => {
  const { t } = useTranslation('sales');

  return (
    <div className={PAYMENT_ROW_CLASS_NAME}>
      <p className={PAYMENT_LABEL_CLASS_NAME}>{t('mobile')}</p>
      <div className="flex items-center">
        <Input
          type="text"
          inputMode="numeric"
          value={formatNumber(amount || '')}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            onAmountChange(parseNumber(e.target.value))
          }
          onClick={onFillIfEmpty}
          className="font-medium tabular-nums"
          placeholder={t('type-amount')}
        />
      </div>
      <div className="flex items-center justify-end">
        <MobileInvoiceSheet
          open={invoiceOpen}
          onOpenChange={onInvoiceOpenChange}
          onCreate={onCreateInvoice}
          amount={amount || remainingAmount}
          currency={currency}
          generating={generatingInvoice}
          invoiceUrl={invoiceUrl}
        />
        <Button variant="ghost" size="icon" onClick={onFill}>
          <IconCircleCheck className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export const MobilePaidRow = ({
  amount,
  paymentId,
}: {
  amount: number;
  paymentId?: string | null;
}) => {
  const { t } = useTranslation('sales');

  return (
    <div className={PAYMENT_ROW_CLASS_NAME}>
      <p className={PAYMENT_LABEL_CLASS_NAME}>{t('mobile-paid')}</p>
      <div className="flex items-center">
        <Input
          readOnly
          value={formatNumber(amount)}
          className="font-medium tabular-nums"
        />
      </div>
      <div className="flex items-center justify-end text-sm text-muted-foreground">
        {paymentId}
      </div>
    </div>
  );
};

export const PaymentTypeRow = ({
  paymentType,
  payInfo = { hasPopup: false, validQr: false },
  hasInitialAmount,
  paymentsData,
  defaultCurrency,
  dealId,
  customerId,
  totalAmount,
  onOpenQr,
  onPointLimit,
  updatePayment,
  fillRemaining,
  fillRemainingIfEmpty,
}: {
  paymentType: PaymentConfigItem;
  payInfo?: PayInfo;
  hasInitialAmount: boolean;
  paymentsData: IPaymentsData;
  defaultCurrency: string;
  dealId: string;
  customerId?: string;
  totalAmount: number;
  onOpenQr: (paymentType: PaymentConfigItem) => void;
  onPointLimit: (typeName: string, limit: number, unavailable: boolean) => void;
  updatePayment: TUpdatePayment;
  fillRemaining: TFillPayment;
  fillRemainingIfEmpty: TFillPayment;
}) => {
  const { t } = useTranslation('sales');
  const typeName = paymentType.type;
  const paymentConfig = parsePaymentConfig(paymentType.config);
  const isQr = paymentConfig?.require?.toLowerCase() === 'qrcode';
  const showQrUnlockInput = isQr && !payInfo.validQr;
  const paysWithPoints = Boolean(paymentType.scoreCampaignId);
  // Locked until loyalty says how much the customer may pay.
  const pointsLocked = paysWithPoints && payInfo.unavailable !== false;

  return (
    <div className={PAYMENT_ROW_CLASS_NAME}>
      <div className="flex items-center gap-2">
        <span
          className={`flex items-center gap-1.5 ${PAYMENT_LABEL_CLASS_NAME}`}
        >
          {paymentType.type}
          {isQr &&
            (payInfo.validQr ? (
              <IconKey size={14} className="text-success" />
            ) : (
              <IconLock size={14} className="text-muted-foreground" />
            ))}
        </span>
      </div>
      <div className="flex flex-col gap-1">
        {showQrUnlockInput ? (
          <Input
            readOnly
            disabled={pointsLocked}
            className="cursor-pointer font-medium tabular-nums text-muted-foreground"
            placeholder={t('read-qrcode')}
            onClick={() => onOpenQr(paymentType)}
            value={
              hasInitialAmount
                ? formatNumber(
                    readDealPayment(paymentsData, typeName)?.amount ?? '',
                  )
                : ''
            }
          />
        ) : (
          <Input
            type="text"
            inputMode="numeric"
            value={formatNumber(
              readDealPayment(paymentsData, typeName)?.amount ?? '',
            )}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const val = parseNumber(e.target.value);
              const max = payInfo.maxVal;
              updatePayment(
                typeName,
                'amount',
                max === undefined ? val : Math.min(val, max),
              );
            }}
            onClick={() => fillRemainingIfEmpty(typeName, payInfo.maxVal)}
            disabled={pointsLocked}
            className="font-medium tabular-nums"
            placeholder={t('type-amount')}
          />
        )}
        {paysWithPoints && (
          <DealPointPaymentLimit
            paymentType={paymentType}
            customerId={customerId}
            dealId={dealId}
            totalAmount={totalAmount}
            onLimit={onPointLimit}
          />
        )}
      </div>
      <div className="flex items-center">
        <CurrencyField.SelectCurrency
          value={getPaymentCurrency(paymentsData, typeName, defaultCurrency)}
          onChange={(val: string) => updatePayment(typeName, 'currency', val)}
          variant="ghost"
          className="w-full justify-end"
        />
        <Button
          variant="ghost"
          size="icon"
          disabled={pointsLocked}
          onClick={() =>
            showQrUnlockInput
              ? onOpenQr(paymentType)
              : fillRemaining(typeName, payInfo.maxVal)
          }
        >
          <IconCircleCheck className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export const PaymentQrDialog = ({
  open,
  password,
  onPasswordChange,
  onDismiss,
  onConfirm,
}: {
  open: boolean;
  password: string;
  onPasswordChange: (password: string) => void;
  onDismiss: () => void;
  onConfirm: () => void;
}) => {
  const { t } = useTranslation('sales');

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen: boolean) => {
        if (!nextOpen) onDismiss();
      }}
    >
      <Dialog.Content className="max-w-sm">
        <Dialog.Header className="gap-1">
          <Dialog.Title>{t('read-qrcode')}</Dialog.Title>
          <Dialog.Description>
            {t('enter-customer-qrcode-to-loyalty-score')}
          </Dialog.Description>
        </Dialog.Header>
        <Input
          type="password"
          value={password}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            onPasswordChange(e.target.value)
          }
          onKeyDown={(e: KeyboardEvent<HTMLInputElement>) =>
            e.key === 'Enter' && onConfirm()
          }
          placeholder={t('enter-customer-qr-code')}
          autoFocus
        />
        <Dialog.Footer>
          <Button variant="outline" onClick={onDismiss}>
            {t('cancel')}
          </Button>
          <Button onClick={onConfirm}>{t('confirm')}</Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};
