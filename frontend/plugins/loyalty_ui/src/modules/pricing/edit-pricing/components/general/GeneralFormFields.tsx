import { PricingAppliesToSelect } from '@/pricing/components/PricingAppliesToSelect';
import { PricingPrioritySelect } from '@/pricing/components/PricingPrioritySelect';
import { GeneralDateField } from '@/pricing/edit-pricing/components/general/GeneralDateField';
import { GeneralTargetFields } from '@/pricing/edit-pricing/components/general/GeneralTargetFields';
import { GeneralFormValues } from '@/pricing/edit-pricing/components/general/types';
import { PricingAppliesTo } from '@/pricing/types';
import { Form, Input, Select } from 'erxes-ui';
import { Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

interface GeneralFormFieldsProps {
  control: Control<GeneralFormValues>;
  appliesTo: PricingAppliesTo;
}

export const GeneralFormFields = ({
  control,
  appliesTo,
}: GeneralFormFieldsProps) => {
  const { t } = useTranslation('loyalty');

  return (
    <>
      <Form.Field
        control={control}
        name="name"
        render={({ field }) => (
          <Form.Item className="min-w-0 md:col-span-12">
            <Form.Label>{t('name')}</Form.Label>
            <Form.Control>
              <Input placeholder={t('enter-pricing-name')} {...field} />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />

      <Form.Field
        control={control}
        name="status"
        render={({ field }) => (
          <Form.Item className="min-w-0 md:col-span-6">
            <Form.Label>{t('status')}</Form.Label>
            <Form.Control>
              <Select value={field.value} onValueChange={field.onChange}>
                <Select.Trigger>
                  <Select.Value placeholder={t('select-status')} />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="active">{t('active')}</Select.Item>
                  <Select.Item value="archived">{t('archived')}</Select.Item>
                  <Select.Item value="draft">{t('draft')}</Select.Item>
                  <Select.Item value="completed">{t('completed')}</Select.Item>
                </Select.Content>
              </Select>
            </Form.Control>
          </Form.Item>
        )}
      />

      <Form.Field
        control={control}
        name="appliesTo"
        render={({ field }) => (
          <Form.Item className="min-w-0 md:col-span-6">
            <Form.Label>{t('applies-to')}</Form.Label>
            <Form.Control>
              <PricingAppliesToSelect
                value={field.value}
                onValueChange={field.onChange}
              />
            </Form.Control>
          </Form.Item>
        )}
      />

      <GeneralTargetFields control={control} appliesTo={appliesTo} />

      <Form.Field
        control={control}
        name="priority"
        render={({ field }) => (
          <Form.Item className="min-w-0 md:col-span-6">
            <Form.Label>{t('priority')}</Form.Label>
            <Form.Control>
              <PricingPrioritySelect
                value={field.value}
                onValueChange={field.onChange}
              />
            </Form.Control>
          </Form.Item>
        )}
      />

      <div className="min-w-0 md:col-span-6">
        <GeneralDateField
          control={control}
          name="startDate"
          label={t('start-date')}
          placeholder={t('select-start-date')}
        />
      </div>

      <div className="min-w-0 md:col-span-6">
        <GeneralDateField
          control={control}
          name="endDate"
          label={t('end-date')}
          placeholder={t('select-end-date')}
        />
      </div>
    </>
  );
};
