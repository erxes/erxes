import { useCallback, useEffect, type ReactNode } from 'react';
import { useMutation } from '@apollo/client';
import { Button, Form, InfoCard, Label, toast } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { PaymentConfiguration } from '@/pos/components/payment/PaymentConfiguration';
import { OtherPayment } from '@/pos/components/payment/OtherPayment';
import mutations from '@/pos/graphql/mutations';
import { usePosDetail } from '@/pos/hooks/usePosDetail';
import { type PaymentType } from '@/pos/types/types';

interface PaymentProps {
  posId?: string;
  posType?: string;
  onSaveActionChange?: (action: ReactNode | null) => void;
}

export interface PaymentFormData {
  paymentIds: string[];
  erxesAppToken: string;
  paymentTypes: PaymentType[];
}

const PAYMENT_FORM_ID = 'pos-payment-form';

const DEFAULT_FORM_VALUES: PaymentFormData = {
  paymentIds: [],
  erxesAppToken: '',
  paymentTypes: [],
};

const Payment: React.FC<PaymentProps> = ({
  posId,
  posType,
  onSaveActionChange,
}) => {
  const { posDetail, loading: detailLoading, error } = usePosDetail(posId);
  const [posEdit, { loading: saving }] = useMutation(mutations.posEdit);
  const form = useForm<PaymentFormData>({
    defaultValues: DEFAULT_FORM_VALUES,
  });
  const { control, handleSubmit, reset, setValue, watch, formState } = form;
  const { isDirty } = formState;

  const paymentTypes = watch('paymentTypes');

  useEffect(() => {
    if (!posDetail) {
      return;
    }

    const validPaymentTypes = (posDetail.paymentTypes ?? [])
      .filter((payment): payment is PaymentType => !!payment._id)
      .map(({ _id, type, title, icon, config }) => ({
        _id,
        type,
        title,
        icon,
        config,
      }));

    reset({
      paymentIds: posDetail.paymentIds ?? [],
      erxesAppToken: posDetail.erxesAppToken ?? '',
      paymentTypes: validPaymentTypes,
    });
  }, [posDetail, reset]);

  const handlePaymentAdded = (payment: PaymentType) => {
    setValue('paymentTypes', [...paymentTypes, payment], {
      shouldDirty: true,
    });
  };

  const handlePaymentUpdated = (payment: PaymentType) => {
    setValue(
      'paymentTypes',
      paymentTypes.map((item) => (item._id === payment._id ? payment : item)),
      { shouldDirty: true },
    );
  };

  const handlePaymentDeleted = (paymentId: string) => {
    setValue(
      'paymentTypes',
      paymentTypes.filter((payment) => payment._id !== paymentId),
      { shouldDirty: true },
    );
  };

  const handleSaveChanges = useCallback(
    async (data: PaymentFormData) => {
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
            paymentIds: data.paymentIds,
            erxesAppToken: data.erxesAppToken,
            paymentTypes: data.paymentTypes.map(
              ({ _id, type, title, icon, config }) => ({
                _id,
                type,
                title,
                icon,
                config,
              }),
            ),
          }
        });

        toast({
          title: 'Success',
          description: 'Payment settings saved successfully',
        });
        reset(data);
      } catch {
        toast({
          title: 'Error',
          description: 'Failed to save payment settings',
          variant: 'destructive',
        });
      }
    },
    [posEdit, posId, reset],
  );

  useEffect(() => {
    if (!onSaveActionChange) {
      return;
    }

    onSaveActionChange(
      isDirty ? (
        <Button
          type="submit"
          form={PAYMENT_FORM_ID}
          size="sm"
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      ) : null,
    );

    return () => onSaveActionChange(null);
  }, [isDirty, onSaveActionChange, saving]);

  const renderContent = () => {
    if (detailLoading) {
      return (
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="space-y-2">
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
      <Form {...form}>
        <form
          id={PAYMENT_FORM_ID}
          onSubmit={handleSubmit(handleSaveChanges)}
          className="space-y-8"
        >
          <section className="space-y-4">
            <PaymentConfiguration control={control} posType={posType} />
          </section>

          <section className="pt-6 space-y-4 border-t">
            <Label>Other Payment</Label>

            <OtherPayment
              paymentTypes={paymentTypes}
              onPaymentAdded={handlePaymentAdded}
              onPaymentUpdated={handlePaymentUpdated}
              onPaymentDeleted={handlePaymentDeleted}
            />
          </section>
        </form>
      </Form>
    );
  };

  return (
    <div className="p-6">
      <InfoCard title="Payment configuration">
        <InfoCard.Content>{renderContent()}</InfoCard.Content>
      </InfoCard>
    </div>
  );
};

export default Payment;
