import { UseFormReturn } from 'react-hook-form';
import { Button } from 'erxes-ui';
import { LoyaltyScoreFormValues } from '../../constants/formSchema';

export const LOYALTY_SCORE_STATUS = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Archived', value: 'archived' },
];

export const LoyaltyScoreAddMoreFields = ({
  form,
}: {
  form: UseFormReturn<LoyaltyScoreFormValues>;
}) => {
  const selectedService = form.watch('conditions.serviceName');

  return (
    <div className="grid grid-cols-2 gap-4 mt-4">
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
        Sales pipeline
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
        POS order
      </Button>
    </div>
  );
};
