import {
  CashPaymentRow,
  MobilePaidRow,
  MobilePaymentRow,
  PaymentQrDialog,
  PaymentTotals,
  PaymentTypeRow,
  parsePaymentConfig,
} from '@/deals/cards/components/detail/product/components/ProductPaymentRows';
import {
  type PayInfo,
  selectPaymentTypesForRender,
  updatePayInfoForScore,
} from '@/deals/cards/components/detail/product/utils/updatePayInfoForScore';
import { useDealsEdit } from '@/deals/cards/hooks/useDeals';
import { IDealDetail, IPaymentsData } from '@/deals/types/deals';
import { readDealPayment } from '@/deals/utils/dealJson';
import type { PaymentConfigItem } from '@/payments';
import { useMutation } from '@apollo/client';
import { IconDeviceFloppy } from '@tabler/icons-react';
import { Button, useToast } from 'erxes-ui';
import {
  type MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { gql } from '~/gql';

const EMPTY_PAYMENT_TYPES: PaymentConfigItem[] = [];

const GENERATE_INVOICE_URL = gql(`
  mutation SalesDealGenerateInvoiceUrl($input: InvoiceInput!) {
    generateInvoiceUrl(input: $input)
  }
`);

export const ProductsPayment = ({
  deal,
  paymentsData: initialPaymentsData,
  onChangePaymentsData,
}: {
  deal: IDealDetail;
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

  const { editDeals, loading: saving } = useDealsEdit({
    fetchPolicy: 'no-cache',
  });
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
  const hasMobilePayments = Boolean(deal.pipeline?.paymentIds?.length);

  const paidAmounts = useMemo(() => {
    const paid: { [currency: string]: number } = {};
    Object.entries(paymentsData).forEach(([type, payment]) => {
      if (type === 'mobile' || typeof payment === 'number') {
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
      return Number(readDealPayment(sourcePaymentsData, type)?.amount || 0);
    },
    [deal.paymentsData, initialPaymentsData],
  );

  const updatePayment = useCallback(
    (type: string, field: 'amount' | 'currency', value: number | string) => {
      setPaymentsData((prev: IPaymentsData) => {
        const updated = {
          ...prev,
          [type]: {
            ...readDealPayment(prev, type),
            [field]: value,
            currency:
              field === 'currency'
                ? (value as string)
                : readDealPayment(prev, type)?.currency || defaultCurrency,
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
      const currency =
        readDealPayment(paymentsData, paymentType)?.currency || defaultCurrency;
      const totalForCurrency = total[currency] || 0;
      const currentPaid = paidAmounts[currency] || 0;
      const currentAmount =
        readDealPayment(paymentsData, paymentType)?.amount || 0;
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
      if (readDealPayment(paymentsData, paymentType)?.amount) {
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

  const [pointsCustomer] = deal.customers || [];

  const handlePointLimit = useCallback(
    (typeName: string, limit: number, unavailable: boolean) => {
      const paymentType = deal.pipeline?.paymentTypes?.find(
        ({ type }) => type === typeName,
      );
      const paymentConfig = parsePaymentConfig(paymentType?.config);
      const requiresQr = paymentConfig?.require?.toLowerCase() === 'qrcode';

      setPayInfoByType((prev) =>
        updatePayInfoForScore(
          prev,
          typeName,
          limit,
          unavailable,
          requiresQr,
          pointsCustomer?._id || '',
          paymentType?.scoreCampaignId || '',
        ),
      );
    },
    [deal.pipeline?.paymentTypes, pointsCustomer?._id],
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
      const payInfo = payInfoByType[typeName];
      const availableAmount = payInfo?.unavailable ? 0 : (payInfo?.limit ?? 0);
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

  const handleSave = async () => {
    const processId = localStorage.getItem('processId') || '';

    try {
      await editDeals({
        variables: {
          paymentsData,
          processId,
          _id: deal._id,
        },
      });
    } catch {
      // useDealsEdit displays the mutation error toast.
    }
  };

  const incomingPaymentTypes =
    deal.pipeline?.paymentTypes || EMPTY_PAYMENT_TYPES;
  const lastPaymentTypesRef = useRef<PaymentConfigItem[]>(incomingPaymentTypes);

  useEffect(() => {
    if (!saving) {
      lastPaymentTypesRef.current = incomingPaymentTypes;
    }
  }, [incomingPaymentTypes, saving]);

  const paymentTypes = selectPaymentTypesForRender(
    incomingPaymentTypes,
    lastPaymentTypesRef.current,
    saving,
  );

  return (
    <div className="@container mx-auto flex w-full max-w-3xl flex-col pb-4">
      <PaymentTotals
        total={total}
        changeAmounts={changeAmounts}
        defaultCurrency={defaultCurrency}
      />
      <div className="w-full divide-y border-b">
        <CashPaymentRow
          paymentsData={paymentsData}
          defaultCurrency={defaultCurrency}
          updatePayment={updatePayment}
          fillRemaining={fillRemaining}
          fillRemainingIfEmpty={fillRemainingIfEmpty}
        />
        {hasMobilePayments && (
          <MobilePaymentRow
            amount={mobileAmount}
            remainingAmount={mobileRemainingAmount}
            currency={defaultCurrency}
            onAmountChange={updateMobileAmount}
            onFill={fillMobileRemaining}
            onFillIfEmpty={fillMobileRemainingIfEmpty}
            invoiceOpen={invoiceSheetOpen}
            onInvoiceOpenChange={setInvoiceSheetOpen}
            onCreateInvoice={handleCreateMobileInvoice}
            generatingInvoice={generatingInvoice}
            invoiceUrl={invoiceUrl}
          />
        )}
        {(deal.mobileAmounts || []).map((mobilePayment, index) => (
          <MobilePaidRow
            key={mobilePayment._id || index}
            amount={mobilePayment.amount || 0}
            paymentId={mobilePayment._id}
          />
        ))}
        {paymentTypes
          .filter((paymentType) => paymentType.type !== 'mobile')
          .map((paymentType) => (
            <PaymentTypeRow
              key={paymentType.type}
              paymentType={paymentType}
              payInfo={payInfoByType[paymentType.type]}
              hasInitialAmount={getInitialPaymentAmount(paymentType.type) > 0}
              paymentsData={paymentsData}
              defaultCurrency={defaultCurrency}
              dealId={deal._id}
              customerId={pointsCustomer?._id ?? undefined}
              totalAmount={total[defaultCurrency] || 0}
              onOpenQr={openQrModal}
              onPointLimit={handlePointLimit}
              updatePayment={updatePayment}
              fillRemaining={fillRemaining}
              fillRemainingIfEmpty={fillRemainingIfEmpty}
            />
          ))}
      </div>

      <div className="sticky bottom-0 mt-4 flex items-center justify-end border-t bg-background/95 py-3 backdrop-blur supports-backdrop-filter:bg-background/85">
        <Button size="sm" onClick={handleSave} disabled={saving}>
          <IconDeviceFloppy className="size-4" />
          {saving ? t('saving') : t('save')}
        </Button>
      </div>

      <PaymentQrDialog
        open={qrModal.open}
        password={qrModal.password}
        onPasswordChange={(password) =>
          setQrModal((prev) => ({ ...prev, password }))
        }
        onDismiss={handleQrDismiss}
        onConfirm={handleQrConfirm}
      />
    </div>
  );
};
