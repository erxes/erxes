import { GeneralFormFields } from '@/pricing/edit-pricing/components/general/GeneralFormFields';
import { GeneralFormValues } from '@/pricing/edit-pricing/components/general/types';
import {
  GENERAL_FORM_DEFAULT_VALUES,
  GENERAL_FORM_ID,
  getGeneralFormValues,
  getGeneralPricingDocument,
} from '@/pricing/edit-pricing/components/general/utils';
import { useEditPricing } from '@/pricing/hooks/useEditPricing';
import { IPricingPlanDetail } from '@/pricing/types';
import { isDateRangeValid } from '@/pricing/utils/date';
import { Button, Form, InfoCard, useToast } from 'erxes-ui';
import { useEffect, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

interface GeneralInfoProps {
  pricingId?: string;
  pricingDetail?: IPricingPlanDetail;
  onSaveActionChange?: (action: ReactNode | null) => void;
}

export const GeneralInfo = ({
  pricingId,
  pricingDetail,
  onSaveActionChange,
}: GeneralInfoProps) => {
  const { t } = useTranslation('loyalty');
  const form = useForm<GeneralFormValues>({
    defaultValues: GENERAL_FORM_DEFAULT_VALUES,
  });
  const appliesTo = form.watch('appliesTo');
  const { editPricing, loading } = useEditPricing();
  const { toast } = useToast();
  const { isDirty } = form.formState;

  useEffect(() => {
    if (pricingDetail) {
      form.reset(getGeneralFormValues(pricingDetail));
    }
  }, [pricingDetail, form]);

  const handleSubmit = async (values: GeneralFormValues) => {
    if (!pricingId) {
      return;
    }

    if (!isDateRangeValid(values.startDate, values.endDate)) {
      form.setError('endDate', {
        type: 'validate',
        message: t('end-date-after-start'),
      });
      toast({
        title: t('invalid-date-range'),
        description: t('end-date-after-start'),
        variant: 'destructive',
      });
      return;
    }

    form.clearErrors(['startDate', 'endDate']);

    try {
      await editPricing(getGeneralPricingDocument(pricingId, values));
      form.reset(values);
      toast({
        title: t('pricing-updated'),
        description: t('changes-saved'),
      });
    } catch {
      toast({
        title: t('failed-to-update-pricing'),
        description: t('unexpected-error'),
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (!onSaveActionChange) {
      return;
    }

    onSaveActionChange(
      isDirty ? (
        <Button
          type="submit"
          form={GENERAL_FORM_ID}
          size="sm"
          disabled={loading || !pricingId}
        >
          {loading ? t('saving') : t('save-changes')}
        </Button>
      ) : null,
    );

    return () => onSaveActionChange(null);
  }, [isDirty, loading, onSaveActionChange, pricingId, t]);

  return (
    <div className="mx-auto w-full max-w-6xl p-4 md:p-6">
      <Form {...form}>
        <form
          id={GENERAL_FORM_ID}
          onSubmit={form.handleSubmit(handleSubmit)}
          noValidate
        >
          <InfoCard title={t('general')}>
            <InfoCard.Content className="grid w-full grid-cols-1 gap-x-4 gap-y-5 p-4 md:grid-cols-12">
              <GeneralFormFields control={form.control} appliesTo={appliesTo} />
            </InfoCard.Content>
          </InfoCard>
        </form>
      </Form>
    </div>
  );
};
