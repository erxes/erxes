import { Form, Input } from 'erxes-ui';
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { SelectSegment } from 'ui-modules';
import { SelectVoucherCampaign } from '../../../components/selects/SelectVoucherCampaign';
import { AssignmentFormValues } from '../../../constants/assignmentFormSchema';

interface AssignmentAddCampaignCoreFieldsProps {
  form: UseFormReturn<AssignmentFormValues>;
}

export const AssignmentAddCampaignCoreFields: React.FC<
  AssignmentAddCampaignCoreFieldsProps
> = ({ form }) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      <Form.Field
        control={form.control}
        name="title"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Title</Form.Label>
            <Form.Control>
              <Input placeholder="Enter assignment title" {...field} />
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
            <Form.Label>SEGMENT</Form.Label>
            <Form.Control>
              <SelectSegment
                selected={field.value?.[0] || undefined}
                onSelect={(id) => field.onChange(id)}
              />
            </Form.Control>
          </Form.Item>
        )}
      />
      <Form.Field
        control={form.control}
        name="voucherCampaignId"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>VOUCHER CAMPAIGN</Form.Label>
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
