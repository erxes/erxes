import { useQuery } from '@apollo/client';
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Form, Input, Select } from 'erxes-ui';
import { VoucherFormValues } from '../../constants/voucherFormSchema';
import { QUERY_SPIN_CAMPAIGNS } from '../../../spin/add-spin-campaign/graphql/queries/getCampaignsQuery';

interface AddVoucherSpinFormProps {
  form: UseFormReturn<VoucherFormValues>;
}

export const AddVoucherSpinForm: React.FC<AddVoucherSpinFormProps> = ({
  form,
}) => {
  const { data: campaignsData } = useQuery(QUERY_SPIN_CAMPAIGNS);
  const spinCampaigns = campaignsData?.spinCampaigns?.list || [];

  return (
    <div className="space-y-4 p-5">
      <Form.Field
        control={form.control}
        name="spinCampaignId"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Spin Campaign</Form.Label>
            <Form.Control>
              <Select onValueChange={field.onChange} value={field.value}>
                <Select.Trigger
                  className={field.value ? '' : 'text-muted-foreground'}
                >
                  {spinCampaigns.find(
                    (campaign: any) => campaign._id === field.value,
                  )?.title || 'Select spin campaign'}
                </Select.Trigger>
                <Select.Content>
                  {spinCampaigns.map((campaign: any) => (
                    <Select.Item key={campaign._id} value={campaign._id}>
                      {campaign.title}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
      <Form.Field
        control={form.control}
        name="spinCount"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Spin Count</Form.Label>
            <Form.Control>
              <Input
                type="number"
                placeholder="Enter spin count"
                value={field.value ?? ''}
                onChange={(e) =>
                  field.onChange(
                    e.target.value === '' ? undefined : Number(e.target.value),
                  )
                }
              />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
    </div>
  );
};
