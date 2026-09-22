import { useEffect, useState, type ReactNode } from 'react';
import { Button, Form, InfoCard, useToast } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { IPricingPlanDetail } from '@/pricing/types';
import { useEditPricing } from '@/pricing/hooks/useEditPricing';
import {
  CustomerBrokerConditions,
  CUSTOMER_BROKER_DEFAULTS,
  customerBrokerFromDetail,
  customerBrokerToDoc,
  type CustomerBrokerFormValues,
} from '@/pricing/edit-pricing/components/options/CustomerBrokerConditions';

interface ParticipantsInfoProps {
  pricingId?: string;
  pricingDetail?: IPricingPlanDetail;
  onSaveActionChange?: (action: ReactNode | null) => void;
}

const PARTICIPANTS_FORM_ID = 'pricing-participants-form';

export const ParticipantsInfo = ({
  pricingId,
  pricingDetail,
  onSaveActionChange,
}: ParticipantsInfoProps) => {
  const { editPricing, loading } = useEditPricing();
  const { toast } = useToast();
  const { t } = useTranslation('loyalty');
  const [initialSnapshot, setInitialSnapshot] =
    useState<Partial<IPricingPlanDetail> | null>(null);

  const form = useForm<CustomerBrokerFormValues>({
    defaultValues: CUSTOMER_BROKER_DEFAULTS,
  });

  const watchedValues = form.watch();
  const currentSnapshot = customerBrokerToDoc(watchedValues);
  const hasChanges =
    !!initialSnapshot &&
    JSON.stringify(initialSnapshot) !== JSON.stringify(currentSnapshot);

  useEffect(() => {
    if (!pricingDetail) {
      return;
    }

    const values = customerBrokerFromDetail(pricingDetail);

    form.reset(values);
    setInitialSnapshot(customerBrokerToDoc(values));
  }, [pricingDetail, form]);

  useEffect(() => {
    if (!onSaveActionChange) {
      return;
    }

    onSaveActionChange(
      hasChanges ? (
        <Button
          type="submit"
          form={PARTICIPANTS_FORM_ID}
          size="sm"
          disabled={loading}
        >
          {loading ? t('saving') : t('save-changes')}
        </Button>
      ) : null,
    );

    return () => onSaveActionChange(null);
  }, [hasChanges, loading, onSaveActionChange, t]);

  const handleSave = async (values: CustomerBrokerFormValues) => {
    if (!pricingId) {
      return;
    }

    const participantDoc = customerBrokerToDoc(values);

    try {
      await editPricing({
        _id: pricingId,
        ...participantDoc,
      });

      form.reset(values);
      setInitialSnapshot(participantDoc);

      toast({
        title: t('participants-updated'),
        description: t('changes-saved'),
      });
    } catch {
      toast({
        title: t('failed-to-update-participants'),
        description: t('unexpected-error'),
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="p-6">
      <InfoCard title={t('participants')}>
        <InfoCard.Content>
          <Form {...form}>
            <form
              id={PARTICIPANTS_FORM_ID}
              onSubmit={form.handleSubmit(handleSave)}
              noValidate
            >
              <CustomerBrokerConditions control={form.control} />
            </form>
          </Form>
        </InfoCard.Content>
      </InfoCard>
    </div>
  );
};
