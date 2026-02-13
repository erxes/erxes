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
  return (
    <div className="grid grid-cols-2 gap-4 mt-4">
      <Button
  type="button"
  onClick={() => form.setValue('conditions.serviceName', 'sales')}
>
  Sales pipeline
</Button>

<Button
  type="button"
  onClick={() => form.setValue('conditions.serviceName', 'pos')}
>
  POS order
</Button>

    </div>
  );
};
