import { useCallback, useEffect, type ReactNode } from 'react';
import { useMutation } from '@apollo/client';
import { Button, Form, InfoCard, toast } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import mutations from '@/pos/graphql/mutations';
import { usePosDetail } from '@/pos/hooks/usePosDetail';
import { OtherPaymentsField, PaymentIdsField } from '@/payments';
import { type PaymentConfigItem } from '@/payments';
import { useTranslation } from 'react-i18next';

interface PaymentProps {
  posId?: string;
  posType?: string;
  onSaveActionChange?: (action: ReactNode | null) => void;
}

export interface PaymentFormData {
  paymentIds: string[];
  paymentTypes: PaymentConfigItem[];
}

const PAYMENT_FORM_ID = 'pos-payment-form';

const DEFAULT_FORM_VALUES: PaymentFormData = {
  paymentIds: [],
  paymentTypes: [],
};

const Payment: React.FC<PaymentProps> = ({ posId, onSaveActionChange }) => {
  const { t } = useTranslation('sales');
  const { posDetail, loading: detailLoading, error } = usePosDetail(posId);
  const [posEdit, { loading: saving }] = useMutation(mutations.posEdit);
  const form = useForm<PaymentFormData>({
    defaultValues: DEFAULT_FORM_VALUES,
  });
  const { control, handleSubmit, reset, formState } = form;
  const { isDirty } = formState;

  useEffect(() => {
    if (!posDetail) {
      return;
    }

    const validPaymentTypes = (posDetail.paymentTypes ?? [])
      .filter((payment): payment is PaymentConfigItem => !!payment._id)
      .map(({ _id, type, title, icon, config, scoreCampaignId }) => ({
        _id,
        type,
        title,
        icon,
        config,
        scoreCampaignId,
      }));

    reset({
      paymentIds: posDetail.paymentIds ?? [],
      paymentTypes: validPaymentTypes,
    });
  }, [posDetail, reset]);

  const handleSaveChanges = useCallback(
    async (data: PaymentFormData) => {
      if (!posId) {
        toast({
          title: t('error'),
          description: t('pos-id-required'),
          variant: 'destructive',
        });
        return;
      }

      try {
        await posEdit({
          variables: {
            _id: posId,
            paymentIds: data.paymentIds,
            paymentTypes: data.paymentTypes.map(
              ({ _id, type, title, icon, config, scoreCampaignId }) => ({
                _id,
                type,
                title,
                icon,
                config,
                scoreCampaignId,
              }),
            ),
          },
        });

        toast({
          title: t('success'),
          description: t('payment-settings-saved'),
        });
        reset(data);
      } catch {
        toast({
          title: t('error'),
          description: t('failed-to-save-payment'),
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
          {saving ? t('saving') : t('save-changes')}
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
            {t('failed-to-load-pos-details', { message: error.message })}
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
          <PaymentIdsField control={control} />
          <OtherPaymentsField control={control} />
        </form>
      </Form>
    );
  };

  return (
    <div className="p-6">
      <InfoCard title={t('payment-configuration')}>
        <InfoCard.Content>{renderContent()}</InfoCard.Content>
      </InfoCard>
    </div>
  );
};

export default Payment;
