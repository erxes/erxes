import { useQuery } from '@apollo/client';
import { Form, Input, Select } from 'erxes-ui';
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { QUERY_LOTTERY_CAMPAIGNS } from '../../../lottery/add-lottery-campaign/graphql/queries/getCampaignsQuery';
import { VoucherFormValues } from '../../constants/voucherFormSchema';

interface AddVoucherLotteryFormProps {
  form: UseFormReturn<VoucherFormValues>;
}

export const AddVoucherLotteryForm: React.FC<AddVoucherLotteryFormProps> = ({
  form,
}) => {
  const { t } = useTranslation('loyalty');
  const { data: campaignsData } = useQuery(QUERY_LOTTERY_CAMPAIGNS);

  const lotteryCampaigns = campaignsData?.getCampaigns?.list || [];

  return (
    <div className="space-y-4 p-5">
      <Form.Field
        control={form.control}
        name="lottery"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('lottery')}</Form.Label>
            <Form.Control>
              <Select onValueChange={field.onChange} value={field.value}>
                <Select.Trigger
                  className={field.value ? '' : 'text-muted-foreground'}
                >
                  {lotteryCampaigns.find(
                    (campaign: any) => campaign._id === field.value,
                  )?.title || t('select-lottery')}
                </Select.Trigger>
                <Select.Content>
                  {lotteryCampaigns.map((campaign: any) => (
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
        name="lotteryCount"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('lottery-count')}</Form.Label>
            <Form.Control>
              <Input
                type="number"
                placeholder={t('enter-lottery-count')}
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
