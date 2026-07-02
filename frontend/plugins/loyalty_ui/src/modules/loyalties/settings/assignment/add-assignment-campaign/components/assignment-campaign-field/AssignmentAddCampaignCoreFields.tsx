import { Form, Input } from 'erxes-ui';
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SelectVoucherCampaign } from '../../../components/selects/SelectVoucherCampaign';
import { AssignmentFormValues } from '../../../constants/assignmentFormSchema';
import { SelectSegment } from '../selects/SelectSegment';

interface AssignmentAddCampaignCoreFieldsProps {
  form: UseFormReturn<AssignmentFormValues>;
}

export const AssignmentAddCampaignCoreFields: React.FC<
  AssignmentAddCampaignCoreFieldsProps
> = ({ form }) => {
  const { t } = useTranslation('loyalty');
  return (
    <div className="grid grid-cols-3 gap-4">
      <Form.Field
        control={form.control}
        name="title"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('title')}</Form.Label>
            <Form.Control>
              <Input placeholder={t('enter-assignment-title')} {...field} />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />

      <Form.Field
        control={form.control}
        name="segmentIds"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('segment')}</Form.Label>
            <SelectSegment
              value={field.value?.[0] || ''}
              onValueChange={(id) => field.onChange(id ? [id] : [])}
              contentTypes={['core:customer', 'core:lead']}
            />
          </Form.Item>
        )}
      />
      <Form.Field
        control={form.control}
        name="voucherCampaignId"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('voucher-campaign')}</Form.Label>
            <Form.Control>
              <SelectVoucherCampaign
                value={field.value || undefined}
                onValueChange={(id) => field.onChange(id)}
              />
            </Form.Control>
          </Form.Item>
        )}
      />
    </div>
  );
};
