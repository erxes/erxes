import { useEffect, useState, useRef } from 'react';
import { Label, Input, Button, toast } from 'erxes-ui';
import { useMutation } from '@apollo/client';
import { usePosDetail } from '@/pos/hooks/usePosDetail';
import mutations from '@/pos/graphql/mutations';
import { isFieldVisible } from '@/pos/constants';
import { SelectPayment } from '@/pos/components/payment/SelectPayment';

interface PaymentConfigurationProps {
  posId?: string;
  posType?: string;
}

export const PaymentConfiguration: React.FC<PaymentConfigurationProps> = ({
  posId,
  posType,
}) => {
  const [paymentIds, setPaymentIds] = useState<string[]>([]);
  const [erxesAppToken, setErxesAppToken] = useState('');
  const [serviceCharge, setServiceCharge] = useState<number | undefined>();
  const [hasChanges, setHasChanges] = useState(false);

  const { posDetail, loading: detailLoading, error } = usePosDetail(posId);
  const [posEdit, { loading: saving }] = useMutation(mutations.posEdit);

  const initializedRef = useRef(false);

  useEffect(() => {
    if (!posDetail || initializedRef.current) return;

    setPaymentIds(posDetail.paymentIds ?? []);
    setErxesAppToken(posDetail.erxesAppToken ?? '');
    setServiceCharge(posDetail.serviceCharge ?? undefined);

    setHasChanges(false);
    initializedRef.current = true;
  }, [posDetail]);

  const handlePaymentChange = (value: string[] | string | null) => {
    setPaymentIds(Array.isArray(value) ? value : value ? [value] : []);
    setHasChanges(true);
  };

  const handleServiceChargeChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value;
    if (value === '') {
      setServiceCharge(undefined);
      setHasChanges(true);
      return;
    }
    const num = Number(value);

    if (Number.isNaN(num)) return;

    const clamped = Math.min(100, Math.max(0, num));
    const rounded = Math.round(clamped * 100) / 100;

    setServiceCharge(rounded);
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
          serviceCharge,
        },
      });

      toast({
        title: 'Success',
        description: 'Payment configuration saved successfully',
      });

      setHasChanges(false);
    } catch {
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

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-destructive">
          Failed to load POS details: {error.message}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isFieldVisible('choosePayment', posType) && (
        <div className="space-y-2">
          <Label>PAYMENTS</Label>

          <SelectPayment
            mode="multiple"
            value={paymentIds}
            onValueChange={handlePaymentChange}
            placeholder="Select payments"
          />
        </div>
      )}

      <div className="flex gap-4 w-full">
        {isFieldVisible('appToken', posType) && (
          <div className="flex-1 space-y-2">
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

        {isFieldVisible('serviceCharge', posType) && (
          <div className="flex-1 space-y-2">
            <Label htmlFor="serviceCharge">Service Charge (%)</Label>

            <div className="relative">
              <Input
                id="serviceCharge"
                type="number"
                min={0}
                max={100}
                step={0.01}
                value={serviceCharge ?? ''}
                className="pr-8 w-full"
                placeholder="0 - 100"
                onChange={handleServiceChargeChange}
              />

              <span className="absolute right-3 top-1/2 text-sm -translate-y-1/2 text-muted-foreground">
                %
              </span>
            </div>
          </div>
        )}
      </div>

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
