import { useEffect, useState } from 'react';
import { Button, Form, InfoCard, useToast } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { IPricingPlanDetail } from '@/pricing/types';
import { useEditPricing } from '@/pricing/hooks/useEditPricing';
import { CustomerBrokerConditions } from '@/pricing/edit-pricing/components/options/CustomerBrokerConditions';
import {
  CUSTOMER_BROKER_DEFAULTS,
  customerBrokerFromDetail,
  customerBrokerToDoc,
  type CustomerBrokerFormValues,
} from '@/pricing/edit-pricing/components/participants/utils';

interface ParticipantsInfoProps {
  pricingId?: string;
  pricingDetail?: IPricingPlanDetail;
}

export const ParticipantsInfo = ({
  pricingId,
  pricingDetail,
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
              onSubmit={form.handleSubmit(handleSave)}
              className="space-y-6"
              noValidate
            >
              <CustomerBrokerConditions control={form.control} />
              <div className="flex justify-end border-t pt-4">
                <Button
                  type="submit"
                  size="sm"
                  disabled={loading || !pricingId || !hasChanges}
                >
                  {loading ? t('saving') : t('save-changes')}
                </Button>
              </div>
            </form>
          </Form>
        </InfoCard.Content>
      </InfoCard>
    </div>
  );
};
