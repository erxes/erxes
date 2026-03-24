import { useState, useEffect, useRef } from 'react';
import { Button, Label, toast, Input } from 'erxes-ui';
import { useMutation } from '@apollo/client';
import { usePosDetail } from '@/pos/hooks/usePosDetail';
import mutations from '@/pos/graphql/mutations';
import { SelectProduct } from 'ui-modules';

interface ServiceChargeProps {
  posId?: string;
}

export const ServiceCharge: React.FC<ServiceChargeProps> = ({ posId }) => {
  const initializedRef = useRef(false);

  const [serviceCharge, setServiceCharge] = useState<number | undefined>();
  const [
    serviceChargeApplicableProductId,
    setServiceChargeApplicableProductId,
  ] = useState<string>('');

  const [hasChanges, setHasChanges] = useState(false);

  const { posDetail, loading: detailLoading, error } = usePosDetail(posId);
  const [posEdit, { loading: saving }] = useMutation(mutations.posEdit);

  useEffect(() => {
    initializedRef.current = false;
  }, [posId]);

  useEffect(() => {
    if (!posDetail || initializedRef.current) return;

    setServiceCharge(posDetail.serviceCharge ?? undefined);
    setServiceChargeApplicableProductId(
      posDetail.serviceChargeApplicableProductId || '',
    );

    setHasChanges(false);
    initializedRef.current = true;
  }, [posDetail]);

  useEffect(() => {
    if (!posDetail) return;

    const originalCharge = posDetail.serviceCharge ?? undefined;
    const originalProduct = posDetail.serviceChargeApplicableProductId || '';

    const isChanged =
      originalCharge !== serviceCharge ||
      originalProduct !== serviceChargeApplicableProductId;

    setHasChanges(isChanged);
  }, [serviceCharge, serviceChargeApplicableProductId, posDetail]);

  const handleServiceChargeChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value;

    if (value === '') {
      setServiceCharge(undefined);
      return;
    }

    if (!/^\d*\.?\d*$/.test(value)) return;

    const num = Number(value);
    if (Number.isNaN(num)) return;

    const clamped = Math.min(100, Math.max(0, num));
    const rounded = Math.round(clamped * 100) / 100;

    setServiceCharge(rounded);
  };

  const handleServiceChargeApplicableProductChange = (
    value: string | string[],
  ) => {
    const nextValue = Array.isArray(value)
      ? (value.at(0) ?? '')
      : (value ?? '');

    setServiceChargeApplicableProductId(nextValue);
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
          serviceCharge,
          serviceChargeApplicableProductId:
            serviceChargeApplicableProductId || null,
        },
        refetchQueries: ['posDetail'],
      });

      toast({
        title: 'Success',
        description: 'Service charge saved successfully',
      });

      setHasChanges(false);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to save service charge',
        variant: 'destructive',
      });
    }
  };

  if (detailLoading) {
    return (
      <div className="space-y-4">
        <div className="w-6 h-6 rounded animate-pulse bg-background" />
        <div className="h-10 rounded animate-pulse bg-background" />
        <div className="w-32 h-6 rounded animate-pulse bg-background" />
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
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div className="space-y-2">
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

      <div className="space-y-2">
        <Label>Applicable Products</Label>
        <SelectProduct
          mode="single"
          value={serviceChargeApplicableProductId}
          onValueChange={handleServiceChargeApplicableProductChange}
          placeholder="Select products to apply service charge"
        />
      </div>

      {hasChanges && (
        <div className="flex justify-end pt-4 border-t md:col-span-2">
          <Button onClick={handleSaveChanges} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      )}
    </div>
  );
};
