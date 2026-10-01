import { Button } from 'erxes-ui';
import { UseFormReturn, useFormState, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { LoyaltyScoreFormValues } from '../../constants/formSchema';
import { ServiceConfigFields } from './ServiceConfigFields';

export const ScoreCampaignSourceSection = ({
  form,
}: {
  form: UseFormReturn<LoyaltyScoreFormValues>;
}) => {
  const { t } = useTranslation('loyalty');
  const selectedService = useWatch({
    control: form.control,
    name: 'conditions.serviceName',
  });
  const { errors } = useFormState({
    control: form.control,
    name: 'conditions.serviceName',
  });

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        {t('score-campaign-source-hint')}
      </p>
      <div className="grid grid-cols-2 gap-4">
        <Button
          type="button"
          variant={selectedService === 'sales' ? 'default' : 'outline'}
          onClick={() =>
            form.setValue('conditions.serviceName', 'sales', {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
        >
          {t('sales-pipeline')}
        </Button>

        <Button
          type="button"
          variant={selectedService === 'pos' ? 'default' : 'outline'}
          onClick={() =>
            form.setValue('conditions.serviceName', 'pos', {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
        >
          {t('pos-order')}
        </Button>
      </div>

      {errors.conditions?.serviceName && (
        <p className="text-xs text-destructive">
          {t('score-campaign-source-required')}
        </p>
      )}
      {selectedService && <ServiceConfigFields form={form} />}
    </div>
  );
};
