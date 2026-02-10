import { Button, CurrencyCode, CurrencyField, Input } from 'erxes-ui';
import { IDeal, IPaymentsData } from '@/deals/types/deals';
import { IconCircleCheck, IconDeviceFloppy } from '@tabler/icons-react';
import { useCallback, useMemo, useState } from 'react';

import { useDealsEdit } from '@/deals/cards/hooks/useDeals';

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
  const { editDeals } = useDealsEdit();

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

  const paidAmounts = useMemo(() => {
    const paid: { [currency: string]: number } = {};
    Object.values(paymentsData).forEach((payment) => {
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
      setPaymentsData((prev) => {
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
    (paymentType: string) => {
      const currency = paymentsData[paymentType]?.currency || defaultCurrency;
      const totalForCurrency = total[currency] || 0;
      const currentPaid = paidAmounts[currency] || 0;
      const currentAmount = paymentsData[paymentType]?.amount || 0;
      const remaining = totalForCurrency - (currentPaid - currentAmount);

      if (remaining > 0) {
        updatePayment(paymentType, 'amount', remaining);
      }
    },
    [paymentsData, defaultCurrency, total, paidAmounts, updatePayment],
  );

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
        proccessId: processId,
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
            className={`font-semibold text-lg flex ${
              Object.values(changeAmounts).some((amount) => amount > 0)
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
          <p className="w-28 font-medium text-sm text-muted-foreground uppercase">
            CASH
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 w-[300px]">
              <Input
                type="text"
                inputMode="numeric"
                value={formatNumber(paymentsData['cash']?.amount ?? '')}
                onChange={(e) =>
                  updatePayment('cash', 'amount', parseNumber(e.target.value))
                }
                onClick={() => fillRemaining('cash')}
                className="text-right font-medium border-0 border-b rounded-none focus-visible:ring-0 px-0 shadow-none text-gray-700"
                placeholder="Type amount"
              />
            </div>
            <div className="w-[300px]">
              <CurrencyField.SelectCurrency
                value={
                  (paymentsData['cash']?.currency as CurrencyCode) ||
                  (defaultCurrency as CurrencyCode)
                }
                onChange={(val) => updatePayment('cash', 'currency', val)}
                variant="ghost"
                className="w-full justify-end"
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => fillRemaining('cash')}
            >
              <IconCircleCheck className="w-5 h-5" />
            </Button>
          </div>
        </div>
        {deal.pipeline?.paymentTypes?.map((paymentType, index) => (
          <div
            key={index}
            className="flex items-center gap-2 py-2 w-full justify-center"
          >
            <p className="w-28 font-medium text-sm text-muted-foreground uppercase">
              {paymentType.type}
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 w-[300px]">
                <Input
                  type="text"
                  inputMode="numeric"
                  value={formatNumber(
                    paymentsData[paymentType.type]?.amount ?? '',
                  )}
                  onChange={(e) =>
                    updatePayment(
                      paymentType.type,
                      'amount',
                      parseNumber(e.target.value),
                    )
                  }
                  onClick={() => fillRemaining(paymentType.type)}
                  className="text-right font-medium border-0 border-b rounded-none focus-visible:ring-0 px-0 shadow-none text-gray-700"
                  placeholder="Type amount"
                />
              </div>
              <div className="w-[300px]">
                <CurrencyField.SelectCurrency
                  value={
                    (paymentsData[paymentType.type]
                      ?.currency as CurrencyCode) ||
                    (defaultCurrency as CurrencyCode)
                  }
                  onChange={(val) =>
                    updatePayment(paymentType.type, 'currency', val)
                  }
                  variant="ghost"
                  className="w-full justify-end"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => fillRemaining(paymentType.type)}
              >
                <IconCircleCheck className="w-5 h-5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-end pt-2">
        <Button size="sm" onClick={handleSave}>
          <IconDeviceFloppy className="w-4 h-4 mr-1" />
          Save
        </Button>
      </div>
    </div>
  );
};

export default ProductsPayment;
