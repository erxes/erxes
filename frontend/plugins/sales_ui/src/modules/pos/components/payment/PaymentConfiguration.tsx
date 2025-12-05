import { useEffect, useState, useMemo, useRef } from 'react';
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
import { usePayments } from '../../hooks/usePayments';
import mutations from '../../graphql/mutations';
import { isFieldVisible } from '../../constants';

interface PaymentConfigurationProps {
  posId?: string;
  posType?: string;
}

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

  const paymentOptions: MultiSelectOption[] = useMemo(
    () => payments.map((p) => ({ value: p._id, label: p.name })),
    [payments],
  );

  const initializedRef = useRef(false);

  useEffect(() => {
    if (!posDetail || initializedRef.current) {
      return;
    }

    setPaymentIds(posDetail.paymentIds || []);
    setErxesAppToken(posDetail.erxesAppToken || '');

    const selected = paymentOptions.filter((opt) =>
      posDetail.paymentIds?.includes(opt.value),
    );
    setSelectedPayments(selected);
    setHasChanges(false);
    initializedRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posDetail]);

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
