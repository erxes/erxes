import { useEffect, useState, useMemo } from 'react';
import {
  Label,
  Input,
  Button,
  toast,
  MultipleSelector,
  MultiSelectOption,
} from 'erxes-ui';
import { useMutation } from '@apollo/client';
import { usePosDetail } from '../../hooks/usePosDetail';
import { usePayments } from '../../create-pos/hooks/usePayments';
import mutations from '../../graphql/mutations';
import { isFieldVisible } from '../../constants';

interface PaymentConfigurationProps {
  posId?: string;
  posType?: string;
}

const STATIC_PAYMENTS = [
  {
    _id: '0sZvoDO76mQ7PtMdYZ_Sy',
    name: 'Эн Эм Эм Эй ХХК',
    kind: 'qpayQuickqr',
  },
  { _id: 'wVwEpQRAmutkBZeTJEYHa', name: 'enkhtuvshin', kind: 'qpay' },
  { _id: 'PYkAu-XZ5Iep8y5b0BYgG', name: 'test', kind: 'qpayQuickqr' },
  { _id: 'OKy6iUk087EpS_gVgzEOt', name: 'Hotel test', kind: 'stripe' },
  { _id: 'yCM0wNZS24r0NSMYRpxqJ', name: 'Nomin', kind: 'qpayQuickqr' },
];

export const PaymentConfiguration: React.FC<PaymentConfigurationProps> = ({
  posId,
  posType,
}) => {
  const [paymentIds, setPaymentIds] = useState<string[]>([]);
  const [selectedPayments, setSelectedPayments] = useState<MultiSelectOption[]>(
    [],
  );
  const [erxesAppToken, setErxesAppToken] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  const { posDetail, loading: detailLoading } = usePosDetail(posId);
  const [posEdit, { loading: saving }] = useMutation(mutations.posEdit);
  const { payments, loading: paymentsLoading } = usePayments({
    status: 'active',
  });

  const paymentsList = payments.length > 0 ? payments : STATIC_PAYMENTS;
  const paymentOptions: MultiSelectOption[] = useMemo(
    () => paymentsList.map((p) => ({ value: p._id, label: p.name })),
    [paymentsList],
  );

  useEffect(() => {
    if (posDetail) {
      setPaymentIds(posDetail.paymentIds || []);
      setErxesAppToken(posDetail.erxesAppToken || '');

      const selected = paymentOptions.filter((opt) =>
        posDetail.paymentIds?.includes(opt.value),
      );
      setSelectedPayments(selected);
      setHasChanges(false);
    }
  }, [posDetail, paymentOptions]);

  const handlePaymentChange = (values: MultiSelectOption[]) => {
    setSelectedPayments(values);
    setPaymentIds(values.map((v) => v.value));
    setHasChanges(true);
  };

  const handleSaveChanges = async () => {
    if (!posId) {
      toast({
        title: 'Error',
        description: 'POS ID is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      await posEdit({
        variables: {
          _id: posId,
          paymentIds,
          erxesAppToken,
        },
      });

      toast({
        title: 'Success',
        description: 'Payment configuration saved successfully',
      });
      setHasChanges(false);
    } catch (err) {
      console.error('Error saving payment config:', err);
      toast({
        title: 'Error',
        description: 'Failed to save payment configuration',
        variant: 'destructive',
      });
    }
  };

  if (detailLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="space-y-2">
            <div className="w-24 h-4 rounded animate-pulse bg-muted" />
            <div className="h-8 rounded animate-pulse bg-muted" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isFieldVisible('choosePayment', posType) && (
        <div className="space-y-2">
          <Label>PAYMENTS</Label>

          <MultipleSelector
            value={selectedPayments}
            onChange={handlePaymentChange}
            defaultOptions={paymentOptions}
            placeholder={paymentsLoading ? 'Loading...' : 'Select payments'}
            hidePlaceholderWhenSelected
            disabled={paymentsLoading}
          />
        </div>
      )}

      {isFieldVisible('appToken', posType) && (
        <div className="space-y-2">
          <Label>ERXES APP TOKEN:</Label>
          <Input
            type="text"
            value={erxesAppToken}
            onChange={(e) => {
              setErxesAppToken(e.target.value);
              setHasChanges(true);
            }}
            placeholder="Enter Erxes app token"
          />
        </div>
      )}

      {hasChanges && (
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={handleSaveChanges} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      )}
    </div>
  );
};
