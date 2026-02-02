import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Form, Input, Select } from 'erxes-ui';
import { useQuery } from '@apollo/client';
import { VoucherFormValues } from '../../constants/voucherFormSchema';
import { getCampaignsQuery } from '../../graphql';

interface AddVoucherLotteryFormProps {
  form: UseFormReturn<VoucherFormValues>;
}

export const AddVoucherLotteryForm: React.FC<AddVoucherLotteryFormProps> = ({
  form,
}) => {
  const { data: campaignsData } = useQuery(getCampaignsQuery, {
    variables: { kind: 'lottery' },
  });

  const lotteryCampaigns = campaignsData?.getCampaigns?.list || [];

  return (
    <div className="space-y-4 p-5">
      <Form.Field
        control={form.control}
        name="lottery"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Lottery</Form.Label>
            <Form.Control>
              <Select onValueChange={field.onChange} value={field.value}>
                <Select.Trigger
                  className={field.value ? '' : 'text-muted-foreground'}
                >
                  {lotteryCampaigns.find(
                    (campaign: any) => campaign._id === field.value,
                  )?.name || 'Select lottery'}
                </Select.Trigger>
                <Select.Content>
                  {lotteryCampaigns.map((campaign: any) => (
                    <Select.Item key={campaign._id} value={campaign._id}>
                      {campaign.name}
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
        name="lotteryCount"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Lottery Count</Form.Label>
            <Form.Control>
              <Input
                type="text"
                placeholder="Enter Lottery Count"
                {...field}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
    </div>
  );
};
