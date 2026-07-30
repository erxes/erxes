import { GeneralFormFields } from '@/pricing/edit-pricing/components/general/GeneralFormFields';
import { GeneralFormValues } from '@/pricing/edit-pricing/components/general/types';
import {
  GENERAL_FORM_DEFAULT_VALUES,
  GENERAL_TARGET_FIELD_NAMES,
  getGeneralFormValues,
  getGeneralPricingDocument,
  getGeneralTargetValidationError,
} from '@/pricing/edit-pricing/components/general/utils';
import { useEditPricing } from '@/pricing/hooks/useEditPricing';
import { IPricingPlanDetail } from '@/pricing/types';
import { isDateRangeValid } from '@/pricing/utils/date';
import { Button, Form, InfoCard, useToast } from 'erxes-ui';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

interface GeneralInfoProps {
  pricingId?: string;
  pricingDetail?: IPricingPlanDetail;
}

export const GeneralInfo = ({ pricingId, pricingDetail }: GeneralInfoProps) => {
  const { t } = useTranslation('loyalty');
  const form = useForm<GeneralFormValues>({
    defaultValues: GENERAL_FORM_DEFAULT_VALUES,
  });
  const appliesTo = form.watch('appliesTo');
  const { editPricing, loading } = useEditPricing();
  const { toast } = useToast();
  const { isDirty } = form.formState;
  const formValues = form.watch();
  const targetValidationError = getGeneralTargetValidationError(formValues, t);
  const isFormValid =
    formValues.name.trim().length > 0 &&
    isDateRangeValid(formValues.startDate, formValues.endDate) &&
    !targetValidationError;

  useEffect(() => {
    if (pricingDetail) {
      form.reset(getGeneralFormValues(pricingDetail));
    }
  }, [pricingDetail, form]);

  useEffect(() => {
    form.clearErrors(GENERAL_TARGET_FIELD_NAMES);
  }, [appliesTo, form]);

  const handleSubmit = async (values: GeneralFormValues) => {
    if (!pricingId) {
      return;
    }

    if (!values.name.trim()) {
      form.setError('name', {
        type: 'required',
        message: t('fill-required-fields'),
      });
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

    const validationError = getGeneralTargetValidationError(values, t);

    if (validationError) {
      form.setError(validationError.field, {
        type: 'validate',
        message: validationError.message,
      });
      toast({
        title: t('missing-pricing-target'),
        description: validationError.message,
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

  return (
    <div className="mx-auto w-full max-w-6xl p-4 md:p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} noValidate>
          <InfoCard title={t('general')}>
            <InfoCard.Content className="grid w-full grid-cols-1 gap-x-4 gap-y-5 p-4 md:grid-cols-12">
              <GeneralFormFields control={form.control} appliesTo={appliesTo} />
              <div className="col-span-full flex justify-end border-t pt-4">
                <Button
                  type="submit"
                  size="sm"
                  disabled={loading || !pricingId || !isDirty || !isFormValid}
                >
                  {loading ? t('saving') : t('save-changes')}
                </Button>
              </div>
            </InfoCard.Content>
          </InfoCard>
        </form>
      </Form>
    </div>
  );
};
