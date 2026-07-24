import {
  type ChangeEvent,
  type KeyboardEvent,
  type MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { gql, useMutation } from '@apollo/client';
import {
  IconAward,
  IconCircleCheck,
  IconDeviceFloppy,
  IconKey,
  IconLock,
} from '@tabler/icons-react';
import {
  Button,
  CurrencyCode,
  CurrencyField,
  Dialog,
  Input,
  Popover,
  Sheet,
  useConfirm,
  useToast,
} from 'erxes-ui';
import { ICustomer } from 'ui-modules';
import { IDeal, IPaymentsData } from '@/deals/types/deals';
import { useDealsEdit } from '@/deals/cards/hooks/useDeals';
import { useRefundScoreCampaign } from '../hooks/useRefundScoreCampaign';
import { useCheckOwnerScore } from '../hooks/useCheckOwnerScore';
import { useTranslation } from 'react-i18next';
import type { PaymentConfigItem } from '@/payments';

type PaymentConfig = {
  require?: string;
  skipEbarimt?: boolean;
  mustCustomer?: boolean;
  notSplit?: boolean;
  preTax?: boolean;
};

type PayInfo = {
  score?: number;
  maxVal?: number;
  hasPopup: boolean;
  validQr: boolean;
};

const GENERATE_INVOICE_URL = gql`
  mutation SalesDealGenerateInvoiceUrl($input: InvoiceInput!) {
    generateInvoiceUrl(input: $input)
  }
`;

const parsePaymentConfig = (config: unknown): PaymentConfig => {
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

const OwnerScoreCampaignScore = ({
  paymentType,
  customers,
  dealId,
  onScoreFetched,
}: {
  paymentType: PaymentConfigItem;
  customers: ICustomer[];
  dealId: string;
  onScoreFetched?: (score: number) => void;
}) => {
  const [customer] = customers || [];
  const { refundScoreCampaign, loading: refundLoading } =
    useRefundScoreCampaign();
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const {
    checkOwnerScore = 0,
    refetch: refetchCheckOwnerScore,
    loading: checkLoading,
  } = useCheckOwnerScore({
    variables: {
      ownerId: customer?._id,
      ownerType: 'customer',
      campaignId: paymentType?.scoreCampaignId,
    },
    skip: !paymentType?.scoreCampaignId || !customer?._id,
  }) || {};

  useEffect(() => {
    if (checkOwnerScore && onScoreFetched) {
      onScoreFetched(checkOwnerScore);
    }
  }, [checkOwnerScore, onScoreFetched]);

  const { t } = useTranslation('sales');

  if (!paymentType?.scoreCampaignId || customers.length === 0) return null;

  const refundScore = () => {
    confirm({
      message: t('loyalty-score-refund-confirm'),
    }).then(() => {
      refundScoreCampaign({
        variables: {
          ownerId: customer._id,
          ownerType: 'customer',
          targetId: dealId,
        },
      })
        .then(() =>
          toast({
            variant: 'success',
            title: t('success'),
            description: t('loyalty-score-refunded'),
          }),
        )
        .catch((error: unknown) =>
          toast({
            variant: 'destructive',
            title: t('error'),
            description: error instanceof Error ? error.message : t('error'),
          }),
        );
      refetchCheckOwnerScore();
    });
  };

  return (
    <Popover>
      <Popover.Trigger asChild>
        <Button variant="ghost" className="w-1">
          <IconAward size={16} className="text-amber-500" />
        </Button>
      </Popover.Trigger>
      <Popover.Content className="w-72 p-0 overflow-hidden rounded-lg shadow-lg border">
        <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border-b">
          <IconAward size={16} className="text-amber-500 shrink-0" />
          <span className="font-semibold text-sm text-foreground truncate">
            {t('score-campaign')}
          </span>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {t('customer')}
            </span>
            <span className="text-sm text-foreground truncate max-w-44">
              {customer.primaryEmail || customer._id}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {t('available-score')}
            </span>
            <span className="text-xl font-bold text-foreground">
              {checkLoading ? (
                <span className="text-sm text-muted-foreground">
                  {t('loading')}…
                </span>
              ) : (
                checkOwnerScore.toLocaleString()
              )}
            </span>
          </div>
          <Button
            onClick={refundScore}
            disabled={refundLoading || checkLoading}
            variant="destructive"
            size="sm"
            className="w-full mt-1"
          >
            {refundLoading ? t('refunding') : t('refund-score')}
          </Button>
        </div>
      </Popover.Content>
    </Popover>
  );
};

export const ProductsPayment = ({
  deal,
  paymentsData: initialPaymentsData,
  onChangePaymentsData,
}: {
  deal: IDeal;
  paymentsData?: IPaymentsData;
  onChangePaymentsData?: (data: IPaymentsData) => void;
}) => {
  const [paymentsData, setPaymentsData] = useState<IPaymentsData>(
    initialPaymentsData || deal.paymentsData || {},
  );
  const [mobileAmount, setMobileAmount] = useState<number>(0);
  const [payInfoByType, setPayInfoByType] = useState<Record<string, PayInfo>>(
    {},
  );
  const [qrModal, setQrModal] = useState<{
    open: boolean;
    paymentType: PaymentConfigItem | null;
    password: string;
  }>({ open: false, paymentType: null, password: '' });
  const [invoiceSheetOpen, setInvoiceSheetOpen] = useState(false);
  const [invoiceUrl, setInvoiceUrl] = useState('');

  const { editDeals } = useDealsEdit();
  const [generateInvoiceUrl, { loading: generatingInvoice }] =
    useMutation(GENERATE_INVOICE_URL);
  const { toast } = useToast();
  const { t } = useTranslation('sales');

  useEffect(() => {
    setMobileAmount(0);
    setInvoiceUrl('');
  }, [deal.mobileAmount]);

  const total = useMemo(() => {
    const amounts: { [currency: string]: number } = {};
    (deal.productsData || []).forEach((data) => {
      if (data.currency && data.tickUsed) {
        amounts[data.currency] =
          (amounts[data.currency] || 0) + (data.amount || 0);
      }
    });
    return amounts;
  }, [deal.productsData]);

  const defaultCurrency = Object.keys(total)[0] || 'MNT';
  const paidMobileAmount = Number(deal.mobileAmount || 0);
  const hasMobilePayments = !!deal.pipeline?.paymentIds?.length;

  const paidAmounts = useMemo(() => {
    const paid: { [currency: string]: number } = {};
    Object.entries(paymentsData).forEach(([type, payment]) => {
      if (type === 'mobile') {
        return;
      }

      if (payment.amount && payment.currency) {
        paid[payment.currency] = (paid[payment.currency] || 0) + payment.amount;
      }
    });
    if (paidMobileAmount) {
      paid[defaultCurrency] = (paid[defaultCurrency] || 0) + paidMobileAmount;
    }
    return paid;
  }, [defaultCurrency, paidMobileAmount, paymentsData]);

  const changeAmounts = useMemo(() => {
    const change: { [currency: string]: number } = {};
    const allCurrencies = new Set([
      ...Object.keys(total),
      ...Object.keys(paidAmounts),
    ]);
    allCurrencies.forEach((currency) => {
      change[currency] = (paidAmounts[currency] || 0) - (total[currency] || 0);
    });
    return change;
  }, [total, paidAmounts]);
  const mobileRemainingAmount = Math.max(
    (total[defaultCurrency] || 0) - (paidAmounts[defaultCurrency] || 0),
    0,
  );

  const getInitialPaymentAmount = useCallback(
    (type: string) => {
      const sourcePaymentsData = initialPaymentsData || deal.paymentsData || {};
      return Number(sourcePaymentsData[type]?.amount || 0);
    },
    [deal.paymentsData, initialPaymentsData],
  );

  const updatePayment = useCallback(
    (type: string, field: 'amount' | 'currency', value: number | string) => {
      setPaymentsData((prev: IPaymentsData) => {
        const updated = {
          ...prev,
          [type]: {
            ...prev[type],
            [field]: value,
            currency:
              field === 'currency'
                ? (value as string)
                : prev[type]?.currency || defaultCurrency,
          },
        };
        onChangePaymentsData?.(updated);
        return updated;
      });
    },
    [defaultCurrency, onChangePaymentsData],
  );

  const fillRemaining = useCallback(
    (paymentType: string, maxVal?: number) => {
      const currency = paymentsData[paymentType]?.currency || defaultCurrency;
      const totalForCurrency = total[currency] || 0;
      const currentPaid = paidAmounts[currency] || 0;
      const currentAmount = paymentsData[paymentType]?.amount || 0;
      const remaining = totalForCurrency - (currentPaid - currentAmount);
      const finalAmount =
        maxVal === undefined ? remaining : Math.min(remaining, maxVal);

      if (finalAmount > 0) {
        updatePayment(paymentType, 'amount', finalAmount);
      }
    },
    [paymentsData, defaultCurrency, total, paidAmounts, updatePayment],
  );

  const fillRemainingIfEmpty = useCallback(
    (paymentType: string, maxVal?: number) => {
      if (paymentsData[paymentType]?.amount) {
        return;
      }

      fillRemaining(paymentType, maxVal);
    },
    [fillRemaining, paymentsData],
  );

  const updateMobileAmount = useCallback((amount: number) => {
    setMobileAmount(amount);
  }, []);

  const fillMobileRemaining = useCallback(() => {
    if (mobileRemainingAmount > 0) {
      updateMobileAmount(mobileRemainingAmount);
    }
  }, [mobileRemainingAmount, updateMobileAmount]);

  const fillMobileRemainingIfEmpty = useCallback(() => {
    if (mobileAmount) {
      return;
    }

    fillMobileRemaining();
  }, [fillMobileRemaining, mobileAmount]);

  const handleCreateMobileInvoice = useCallback(
    async (event?: MouseEvent<HTMLButtonElement>) => {
      event?.preventDefault();

      const paymentIds = deal.pipeline?.paymentIds || [];
      if (!paymentIds.length) {
        toast({
          variant: 'destructive',
          title: t('payment-methods-missing'),
          description: t('please-select-online-payments'),
        });
        return;
      }

      const amount = mobileAmount || mobileRemainingAmount;
      if (!amount) {
        toast({
          variant: 'destructive',
          title: t('amount-missing'),
          description: t('please-enter-mobile-amount'),
        });
        return;
      }

      setInvoiceUrl('');
      setInvoiceSheetOpen(true);

      try {
        const { data } = await generateInvoiceUrl({
          variables: {
            input: {
              amount,
              currency: defaultCurrency,
              description: deal.name,
              contentType: 'sales:deal',
              contentTypeId: deal._id,
              paymentIds,
            },
          },
        });

        const url = data?.generateInvoiceUrl;
        if (url) {
          setInvoiceUrl(url);
          return;
        }

        toast({
          variant: 'destructive',
          title: t('payment-url-missing'),
          description: t('invoice-created-no-url'),
        });
      } catch (error) {
        toast({
          variant: 'destructive',
          title: t('failed-to-create-payment'),
          description:
            error instanceof Error
              ? error.message
              : t('please-try-again-later'),
        });
      }
    },
    [
      deal._id,
      deal.name,
      deal.pipeline?.paymentIds,
      defaultCurrency,
      generateInvoiceUrl,
      mobileAmount,
      mobileRemainingAmount,
      t,
      toast,
    ],
  );

  const handleScoreFetched = useCallback(
    (score: number, paymentType: PaymentConfigItem) => {
      const typeName = paymentType.type;
      const paymentConfig = parsePaymentConfig(paymentType.config);
      const requiresQr = paymentConfig?.require?.toLowerCase() === 'qrcode';
      const initialAmount = getInitialPaymentAmount(typeName);
      const availableAmount = score + initialAmount;

      setPayInfoByType((prev) => {
        const validQr = prev[typeName]?.validQr || false;

        return {
          ...prev,
          [typeName]: {
            hasPopup: requiresQr,
            score,
            maxVal: requiresQr
              ? validQr
                ? availableAmount
                : 0
              : availableAmount,
            validQr,
          },
        };
      });
    },
    [getInitialPaymentAmount],
  );

  const openQrModal = (paymentType: PaymentConfigItem) => {
    setQrModal({ open: true, paymentType, password: '' });
  };

  const handleQrDismiss = () => {
    const typeName = qrModal.paymentType?.type;
    if (typeName) {
      const initialAmount = getInitialPaymentAmount(typeName);
      setPayInfoByType((prev) => ({
        ...prev,
        [typeName]: {
          ...(prev[typeName] || { hasPopup: true, validQr: false }),
          maxVal: 0,
        },
      }));
      if (!initialAmount) {
        updatePayment(typeName, 'amount', 0);
      }
    }
    setQrModal({ open: false, paymentType: null, password: '' });
  };

  const handleQrConfirm = () => {
    const [customer] = deal.customers || [];
    const typeName = qrModal.paymentType?.type;
    if (!typeName) return;

    if (qrModal.password && customer?._id === qrModal.password) {
      const score = payInfoByType[typeName]?.score ?? 0;
      const availableAmount = score + getInitialPaymentAmount(typeName);
      setPayInfoByType((prev) => ({
        ...prev,
        [typeName]: {
          ...(prev[typeName] || { hasPopup: true }),
          validQr: true,
          maxVal: availableAmount,
        },
      }));
      setQrModal({ open: false, paymentType: null, password: '' });
      fillRemaining(typeName, availableAmount);
    } else {
      const initialAmount = getInitialPaymentAmount(typeName);
      setPayInfoByType((prev) => ({
        ...prev,
        [typeName]: {
          ...(prev[typeName] || { hasPopup: true }),
          validQr: false,
          maxVal: 0,
        },
      }));
      if (!initialAmount) {
        updatePayment(typeName, 'amount', 0);
      }
      setQrModal({ open: false, paymentType: null, password: '' });
      toast({
        variant: 'destructive',
        title: t('invalid-qr-code'),
        description: t('qr-code-mismatch'),
      });
    }
  };

  const formatNumber = (value: number | string) => {
    if (value === '' || value === null || value === undefined) return '';
    const num =
      typeof value === 'number' ? value : Number(value.replace(/,/g, ''));

    if (isNaN(num)) return '';
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

  const renderTotals = (amounts: { [currency: string]: number }) => {
    const entries = Object.entries(amounts).filter(([, val]) => val !== 0);
    if (entries.length === 0) {
      return <span>0 {defaultCurrency}</span>;
    }
    return entries.map(([currency, amount]) => (
      <div key={currency}>{renderAmount(amount, currency)}</div>
    ));
  };

  const handleSave = () => {
    const processId = localStorage.getItem('processId') || '';

    editDeals({
      variables: {
        paymentsData,
        processId: processId,
        _id: deal._id,
      },
    });
  };

  const paymentTypes = deal.pipeline?.paymentTypes || [];

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col pb-4">
      <div className="grid grid-cols-2 border-y bg-muted/15">
        <div className="flex flex-col items-center px-4 py-5">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t('total')}
          </span>
          <div className="mt-1 text-lg font-semibold tabular-nums">
            {renderTotals(total)}
          </div>
        </div>
        <div className="flex flex-col items-center border-l px-4 py-5">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t('change')}
          </span>
          <div
            className={`mt-1 flex text-lg font-semibold tabular-nums ${
              Object.values(changeAmounts).some((amount) => amount > 0)
                ? 'text-success'
                : Object.values(changeAmounts).some((amount) => amount < 0)
                ? 'text-destructive'
                : ''
            }`}
          >
            {Object.values(changeAmounts).some((amount) => amount > 0) && '+'}
            {renderTotals(changeAmounts)}
          </div>
        </div>
      </div>
      <div className="w-full divide-y border-b">
        <div className="grid gap-3 py-3 sm:grid-cols-[minmax(8rem,1fr)_minmax(10rem,1fr)_minmax(8rem,1fr)] sm:items-center">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t('cash')}
          </p>
          <div className="flex items-center">
            <Input
              type="text"
              inputMode="numeric"
              value={formatNumber(paymentsData['cash']?.amount ?? '')}
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
              value={
                (paymentsData['cash']?.currency as CurrencyCode) ||
                (defaultCurrency as CurrencyCode)
              }
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
        {hasMobilePayments && (
          <div className="grid gap-3 py-3 sm:grid-cols-[minmax(8rem,1fr)_minmax(10rem,1fr)_minmax(8rem,1fr)] sm:items-center">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t('mobile')}
            </p>
            <div className="flex items-center">
              <Input
                type="text"
                inputMode="numeric"
                value={formatNumber(mobileAmount || '')}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  updateMobileAmount(parseNumber(e.target.value))
                }
                onClick={fillMobileRemainingIfEmpty}
                className="font-medium tabular-nums"
                placeholder={t('type-amount')}
              />
            </div>
            <div className="flex items-center justify-end">
              <Sheet open={invoiceSheetOpen} onOpenChange={setInvoiceSheetOpen}>
                <Sheet.Trigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCreateMobileInvoice}
                    disabled={generatingInvoice}
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
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {t('amount')}
                      </span>
                      <span className="font-medium">
                        {formatNumber(mobileAmount || mobileRemainingAmount)}{' '}
                        {defaultCurrency}
                      </span>
                    </div>
                    {generatingInvoice && (
                      <div className="flex h-96 items-center justify-center rounded-md border text-sm text-muted-foreground">
                        {t('generating-payment')}
                      </div>
                    )}
                    {!generatingInvoice && invoiceUrl && (
                      <>
                        <Input
                          readOnly
                          value={invoiceUrl}
                          className="font-mono text-xs"
                        />
                        <iframe
                          title="QPay payment"
                          src={invoiceUrl}
                          className="h-[70vh] w-full rounded-md border"
                        />
                      </>
                    )}
                    {!generatingInvoice && !invoiceUrl && (
                      <div className="flex h-96 items-center justify-center rounded-md border text-sm text-muted-foreground">
                        {t('payment-response')}
                      </div>
                    )}
                  </Sheet.Content>
                </Sheet.View>
              </Sheet>
              <Button variant="ghost" size="icon" onClick={fillMobileRemaining}>
                <IconCircleCheck className="w-5 h-5" />
              </Button>
            </div>
          </div>
        )}
        {(deal.mobileAmounts || []).map((mobilePayment, index) => (
          <div
            key={mobilePayment._id || index}
            className="grid gap-3 py-3 sm:grid-cols-[minmax(8rem,1fr)_minmax(10rem,1fr)_minmax(8rem,1fr)] sm:items-center"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t('mobile-paid')}
            </p>
            <div className="flex items-center">
              <Input
                readOnly
                value={formatNumber(mobilePayment.amount || 0)}
                className="font-medium tabular-nums"
              />
            </div>
            <div className="flex items-center justify-end text-sm text-muted-foreground">
              {mobilePayment._id}
            </div>
          </div>
        ))}
        {paymentTypes
          .filter((paymentType) => paymentType.type !== 'mobile')
          .map((paymentType) => {
            const typeName = paymentType.type;
            const paymentConfig = parsePaymentConfig(paymentType.config);
            const isQr = paymentConfig?.require?.toLowerCase() === 'qrcode';
            const hasInitialAmount = getInitialPaymentAmount(typeName) > 0;
            const payInfo = payInfoByType[typeName] || {
              hasPopup: false,
              validQr: false,
            };
            const showQrUnlockInput = isQr && !payInfo.validQr;
            return (
              <div
                key={paymentType.type}
                className="grid gap-3 py-3 sm:grid-cols-[minmax(8rem,1fr)_minmax(10rem,1fr)_minmax(8rem,1fr)] sm:items-center"
              >
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {paymentType.type}
                    {isQr &&
                      (payInfo.validQr ? (
                        <IconKey size={14} className="text-success" />
                      ) : (
                        <IconLock size={14} className="text-muted-foreground" />
                      ))}
                  </span>
                  <OwnerScoreCampaignScore
                    paymentType={paymentType}
                    customers={deal.customers || []}
                    dealId={deal._id}
                    onScoreFetched={(score) =>
                      handleScoreFetched(score, paymentType)
                    }
                  />
                </div>
                <div className="flex items-center">
                  {showQrUnlockInput ? (
                    <Input
                      readOnly
                      className="cursor-pointer font-medium tabular-nums text-muted-foreground"
                      placeholder={t('read-qrcode')}
                      onClick={() => openQrModal(paymentType)}
                      value={
                        hasInitialAmount
                          ? formatNumber(paymentsData[typeName]?.amount ?? '')
                          : ''
                      }
                    />
                  ) : (
                    <Input
                      type="text"
                      inputMode="numeric"
                      value={formatNumber(paymentsData[typeName]?.amount ?? '')}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        const val = parseNumber(e.target.value);
                        const max = payInfo.maxVal;
                        updatePayment(
                          typeName,
                          'amount',
                          max === undefined ? val : Math.min(val, max),
                        );
                      }}
                      onClick={() =>
                        fillRemainingIfEmpty(typeName, payInfo.maxVal)
                      }
                      className="font-medium tabular-nums"
                      placeholder={t('type-amount')}
                    />
                  )}
                </div>
                <div className="flex items-center">
                  <CurrencyField.SelectCurrency
                    value={
                      (paymentsData[typeName]?.currency as CurrencyCode) ||
                      (defaultCurrency as CurrencyCode)
                    }
                    onChange={(val: string) =>
                      updatePayment(typeName, 'currency', val)
                    }
                    variant="ghost"
                    className="w-full justify-end"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      showQrUnlockInput
                        ? openQrModal(paymentType)
                        : fillRemaining(typeName, payInfo.maxVal)
                    }
                  >
                    <IconCircleCheck className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            );
          })}
      </div>

      <div className="sticky bottom-0 mt-4 flex items-center justify-end border-t bg-background/95 py-3 backdrop-blur supports-backdrop-filter:bg-background/85">
        <Button size="sm" onClick={handleSave}>
          <IconDeviceFloppy className="size-4" />
          {t('save')}
        </Button>
      </div>

      <Dialog
        open={qrModal.open}
        onOpenChange={(open: boolean) => {
          if (!open) handleQrDismiss();
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
            value={qrModal.password}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setQrModal((prev) => ({ ...prev, password: e.target.value }))
            }
            onKeyDown={(e: KeyboardEvent<HTMLInputElement>) =>
              e.key === 'Enter' && handleQrConfirm()
            }
            placeholder={t('enter-customer-qr-code')}
            autoFocus
          />
          <Dialog.Footer>
            <Button variant="outline" onClick={handleQrDismiss}>
              {t('cancel')}
            </Button>
            <Button onClick={handleQrConfirm}>{t('confirm')}</Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>
    </div>
  );
};
