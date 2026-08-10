import { Button, Sheet, Form } from 'erxes-ui';
import { IconPlus } from '@tabler/icons-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useAddCoupon } from '../hooks/useAddCoupon';
import { SelectCouponCampaignFormItem } from './selects/SelectCouponCampaign';

interface CouponAddFormValues {
  campaignId: string;
}

export const CouponAddModal = () => {
  const [open, setOpen] = useState(false);
  const { couponAdd, loading } = useAddCoupon();
  const { t } = useTranslation('loyalty');

  const form = useForm<CouponAddFormValues>({
    defaultValues: { campaignId: '' },
  });

  const onSubmit = async (values: CouponAddFormValues) => {
    if (!values.campaignId) return;
    const result = await couponAdd(values.campaignId);
    if (result?.data) {
      setOpen(false);
      form.reset();
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen} modal>
      <Sheet.Trigger asChild>
        <Button>
          <IconPlus />
          {t('add-coupon')}
        </Button>
      </Sheet.Trigger>
      <Sheet.View className="sm:max-w-md p-0">
        <Sheet.Header className="border-b gap-3 px-6 py-4">
          <Sheet.Title>{t('new-coupon')}</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="p-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              <Form.Field
                control={form.control}
                name="campaignId"
                rules={{ required: t('campaign-required') }}
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('campaign')}</Form.Label>
                    <SelectCouponCampaignFormItem
                      value={field.value}
                      onValueChange={(val) => field.onChange(val)}
                      placeholder={t('choose-coupon-campaign')}
                    />
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  {t('close')}
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? t('saving') : t('save')}
                </Button>
              </div>
            </form>
          </Form>
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
};
