import {
  type ChangeEvent,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
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
  useConfirm,
  useToast,
} from 'erxes-ui';
import { ICustomer } from 'ui-modules';
import { IDeal, IPaymentsData } from '@/deals/types/deals';
import { useDealsEdit } from '@/deals/cards/hooks/useDeals';
import { useRefundScoreCampaign } from '../hooks/useRefundScoreCampaign';
import { useCheckOwnerScore } from '../hooks/useCheckOwnerScore';

interface IPaymentType {
  type: string;
  title?: string;
  icon?: string;
  config?: {
    require?: string;
    skipEbarimt?: boolean;
    mustCustomer?: boolean;
    notSplit?: boolean;
    preTax?: boolean;
  };
  scoreCampaign?: string;
}

type PayInfo = {
  score?: number;
  maxVal?: number;
  hasPopup: boolean;
  validQr: boolean;
};

const OwnerScoreCampaignScore = ({
  paymentType,
  customers,
  dealId,
  onScoreFetched,
}: {
  paymentType: IPaymentType;
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
      campaignId: paymentType?.scoreCampaign,
    },
    skip: !paymentType?.scoreCampaign || !customer?._id,
  }) || {};

  useEffect(() => {
    if (checkOwnerScore && onScoreFetched) {
      onScoreFetched(checkOwnerScore);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkOwnerScore]);

  if (!paymentType?.scoreCampaign || customers.length === 0) return null;

  const refundScore = () => {
    confirm({
      message:
        'This action will refund all loyalty scores used on this card and deduct any retrieved scores before processing the refund.\n Are you sure ?',
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
            title: 'Success',
            description: 'Loyalty Score refunded successfully',
          }),
        )
        .catch((error: any) =>
          toast({
            variant: 'destructive',
            title: 'Error',
            description: error.message,
          }),
        );
      refetchCheckOwnerScore();
    });
  };
  return (
    <Popover>
      <Popover.Trigger asChild>
        <Button variant="ghost" className='w-1'>
          <IconAward size={16} className="text-amber-500" />
        </Button>
      </Popover.Trigger>
      <Popover.Content className="w-72 p-0 overflow-hidden rounded-lg shadow-lg border">
        <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border-b">
          <IconAward size={16} className="text-amber-500 shrink-0" />
          <span className="font-semibold text-sm text-foreground truncate">
            Score Campaign
          </span>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Customer
            </span>
            <span className="text-sm text-foreground truncate max-w-44">
              {customer.primaryEmail || customer._id}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Available Score
            </span>
            <span className="text-xl font-bold text-foreground">
              {checkLoading ? (
                <span className="text-sm text-muted-foreground">Loading…</span>
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
            {refundLoading ? 'Refunding…' : 'Refund Score'}
          </Button>
        </div>
      </Popover.Content>
    </Popover>
  );
};

const ProductsPayment = ({
  deal,
  paymentsData: initialPaymentsData,
  onChangePaymentsData,
  refetch,
}: {
  deal: IDeal;
  paymentsData?: IPaymentsData;
  onChangePaymentsData?: (data: IPaymentsData) => void;
  refetch: () => void;
}) => {
  const [paymentsData, setPaymentsData] = useState<IPaymentsData>(
    initialPaymentsData || deal.paymentsData || {},
  );
  const [payInfoByType, setPayInfoByType] = useState<Record<string, PayInfo>>(
    {},
  );
  const [qrModal, setQrModal] = useState<{
    open: boolean;
    paymentType: any;
    password: string;
  }>({ open: false, paymentType: null, password: '' });

  const { editDeals } = useDealsEdit();
  const { toast } = useToast();

  const total = useMemo(() => {
    const amounts: { [currency: string]: number } = {};
    (deal.productsData || []).forEach((data: any) => {
      if (data.currency && data.tickUsed) {
        amounts[data.currency] =
          (amounts[data.currency] || 0) + (data.amount || 0);
      }
    });
    return amounts;
  }, [deal.productsData]);

  const paidAmounts = useMemo(() => {
    const paid: { [currency: string]: number } = {};
    Object.values(paymentsData).forEach((payment: any) => {
      if (payment.amount && payment.currency) {
        paid[payment.currency] = (paid[payment.currency] || 0) + payment.amount;
      }
    });
    return paid;
  }, [paymentsData]);

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

  const defaultCurrency = Object.keys(total)[0] || 'MNT';

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

  const handleScoreFetched = useCallback((score: number, paymentType: any) => {
    const typeName = paymentType.type;
    const requiresQr = paymentType?.config?.require?.toLowerCase() === 'qrcode';
    setPayInfoByType((prev) => ({
      ...prev,
      [typeName]: {
        hasPopup: requiresQr,
        score,
        maxVal: requiresQr ? (prev[typeName]?.validQr ? score : 0) : score,
        validQr: prev[typeName]?.validQr || false,
      },
    }));
  }, []);

  const openQrModal = (paymentType: any) => {
    setQrModal({ open: true, paymentType, password: '' });
  };

  const handleQrDismiss = () => {
    const typeName = qrModal.paymentType?.type;
    if (typeName) {
      setPayInfoByType((prev) => ({
        ...prev,
        [typeName]: {
          ...(prev[typeName] || { hasPopup: true, validQr: false }),
          maxVal: 0,
        },
      }));
      updatePayment(typeName, 'amount', 0);
    }
    setQrModal({ open: false, paymentType: null, password: '' });
  };

  const handleQrConfirm = () => {
    const [customer] = deal.customers || [];
    const typeName = qrModal.paymentType?.type;
    if (!typeName) return;

    if (qrModal.password && customer?._id === qrModal.password) {
      const score = payInfoByType[typeName]?.score ?? 0;
      setPayInfoByType((prev) => ({
        ...prev,
        [typeName]: {
          ...(prev[typeName] || { hasPopup: true }),
          validQr: true,
          maxVal: score,
        },
      }));
      setQrModal({ open: false, paymentType: null, password: '' });
      fillRemaining(typeName, score);
    } else {
      setPayInfoByType((prev) => ({
        ...prev,
        [typeName]: {
          ...(prev[typeName] || { hasPopup: true }),
          validQr: false,
          maxVal: 0,
        },
      }));
      updatePayment(typeName, 'amount', 0);
      setQrModal({ open: false, paymentType: null, password: '' });
      toast({
        variant: 'destructive',
        title: 'Invalid QR Code',
        description: 'The entered code does not match the customer ID.',
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
        <span className="text-red-500">
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
    const entries = Object.entries(amounts).filter(([_, val]) => val !== 0);
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
  return (
    <div className="flex flex-col gap-4 px-8">
      <div className="flex bg-muted/50 rounded-lg p-3 gap-12 justify-center">
        <div className="flex flex-col items-center">
          <span className="text-xs font-medium text-muted-foreground uppercase">
            Total
          </span>
          <div className="font-semibold text-lg">{renderTotals(total)}</div>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xs font-medium text-muted-foreground uppercase">
            Change
          </span>
          <div
            className={`font-semibold text-lg flex ${Object.values(changeAmounts).some((amount) => amount > 0)
              ? 'text-green-500'
              : Object.values(changeAmounts).some((amount) => amount < 0)
                ? 'text-red-500'
                : ''
              }`}
          >
            {Object.values(changeAmounts).some((amount) => amount > 0) && '+'}
            {renderTotals(changeAmounts)}
          </div>
        </div>
      </div>
      <div className="w-full items-center justify-center">
        <div className="flex items-center gap-2 py-2 w-full justify-center">
          <div className="flex w-full justify-between items-center">
            <p className="flex flex-1 gap-2 font-medium text-sm text-muted-foreground uppercase">
              CASH
            </p>
            <div className="flex flex-1 items-center">
              <Input
                type="text"
                inputMode="numeric"
                value={formatNumber(paymentsData['cash']?.amount ?? '')}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  updatePayment('cash', 'amount', parseNumber(e.target.value))
                }
                onClick={() => fillRemaining('cash')}
                className="text-right font-medium border-0 border-b rounded-none focus-visible:ring-0 px-0 shadow-none text-gray-700"
                placeholder="Type amount"
              />
            </div>
            <div className="flex flex-1 items-center">
              <CurrencyField.SelectCurrency
                value={
                  (paymentsData['cash']?.currency as CurrencyCode) ||
                  (defaultCurrency as CurrencyCode)
                }
                onChange={(val: string) =>
                  updatePayment('cash', 'currency', val)
                }
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
        </div>
        {deal.pipeline?.paymentTypes?.map(
          (paymentType: IPaymentType, index: number) => {
            const typeName = paymentType.type;
            const payInfo = payInfoByType[typeName] || {
              hasPopup: false,
              validQr: false,
            };
            const isQr =
              paymentType?.config?.require?.toLowerCase() === 'qrcode';
            return (
              <div
                key={index}
                className="flex items-center gap-2 py-2 w-full justify-center"
              >
                <div className="flex w-full justify-between items-center">
                  <p className="flex flex-1 gap-2 font-medium text-sm text-muted-foreground uppercase items-center">
                    {paymentType.type}
                    {isQr &&
                      (payInfo.validQr ? (
                        <IconKey size={14} className="text-green-500" />
                      ) : (
                        <IconLock size={14} className="text-gray-400" />
                      ))}
                  </p>
                  <OwnerScoreCampaignScore
                    paymentType={paymentType}
                    customers={deal.customers || []}
                    dealId={deal._id}
                    onScoreFetched={(score) =>
                      handleScoreFetched(score, paymentType)
                    }
                  />
                  <div className="flex flex-1 items-center">
                    {isQr && !payInfo.validQr ? (
                      <Input
                        readOnly
                        className="text-right font-medium border-0 border-b rounded-none focus-visible:ring-0 px-0 shadow-none text-gray-400 cursor-pointer"
                        placeholder="Read QRCode"
                        onClick={() => openQrModal(paymentType)}
                        value=""
                      />
                    ) : (
                      <Input
                        type="text"
                        inputMode="numeric"
                        value={formatNumber(
                          paymentsData[typeName]?.amount ?? '',
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
                        onClick={() => fillRemaining(typeName, payInfo.maxVal)}
                        className="text-right font-medium border-0 border-b rounded-none focus-visible:ring-0 px-0 shadow-none text-gray-700"
                        placeholder="Type amount"
                      />
                    )}
                  </div>
                  <div className="flex flex-1 items-center">
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
                      onClick={() => fillRemaining(typeName, payInfo.maxVal)}
                    >
                      <IconCircleCheck className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          },
        )}
      </div>

      <div className="flex items-center justify-end pt-2">
        <Button size="sm" onClick={handleSave}>
          <IconDeviceFloppy className="w-4 h-4 mr-1" />
          Save
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
            <Dialog.Title>Read QR Code</Dialog.Title>
            <Dialog.Description>
              Enter the customer QR code to unlock loyalty score payment.
            </Dialog.Description>
          </Dialog.Header>
          {/* <div className="py-2"> */}
          <Input
            type="password"
            value={qrModal.password}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setQrModal((prev) => ({ ...prev, password: e.target.value }))
            }
            onKeyDown={(e: KeyboardEvent<HTMLInputElement>) =>
              e.key === 'Enter' && handleQrConfirm()
            }
            placeholder="Enter customer QR code"
            autoFocus
          />
          {/* </div> */}
          <Dialog.Footer>
            <Button variant="outline" onClick={handleQrDismiss}>
              Cancel
            </Button>
            <Button onClick={handleQrConfirm}>Confirm</Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>
    </div>
  );
};

export default ProductsPayment;
