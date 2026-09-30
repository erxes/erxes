import { Checkbox, Form } from 'erxes-ui';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { LoyaltyScoreFormValues } from '../../constants/formSchema';

// Whether discounted items count toward points.
export const ServiceConfigFields = ({
  form,
}: {
  form: UseFormReturn<LoyaltyScoreFormValues>;
}) => {
  const { t } = useTranslation('loyalty');

  return (
    <div>
      <h3 className="text-base font-semibold text-primary mb-3">
        {t('product-based-rule')}
      </h3>
      <Form.Field
        control={form.control}
        name="additionalConfig.discountCheck"
        render={({ field }) => (
          <Form.Item className="flex flex-row items-center gap-3">
            <Form.Label className="mb-0 uppercase text-xs tracking-wide">
              {t('discount-check-optional')}
            </Form.Label>
            <Form.Control>
              <Checkbox
                checked={field.value ?? false}
                onCheckedChange={field.onChange}
              />
            </Form.Control>
          </Form.Item>
        )}
      />
    </div>
  );
};
