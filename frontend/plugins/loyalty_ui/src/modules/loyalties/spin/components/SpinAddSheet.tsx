import { useTranslation } from 'react-i18next';
import { IconPlus } from '@tabler/icons-react';
import { Button, Form, Sheet, Select } from 'erxes-ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAddSpin } from '../hooks/useAddSpin';
import { SelectOwnerByType } from '../../scores/components/selects/SelectOwnerByType';
import { SelectSpinCampaign } from './selects/SelectSpinCampaign';
import { SelectVoucherCampaign } from '../../vouchers/components/selects/SelectVoucherCampaign';

interface SpinAddFormValues {
  campaignId: string;
  ownerId: string;
  ownerType: string;
  status: string;
  voucherCampaignId: string;
}

export const SpinAddSheet = () => {
  const { t } = useTranslation('loyalty');
  const [open, setOpen] = useState(false);
  const { spinAdd, loading } = useAddSpin();

  const form = useForm<SpinAddFormValues>({
    defaultValues: {
      campaignId: '',
      ownerId: '',
      ownerType: 'customer',
      status: 'new',
      voucherCampaignId: '',
    },
  });

  const ownerType = form.watch('ownerType');

  const onSubmit = async (values: SpinAddFormValues) => {
    try {
      const result = await spinAdd({
        campaignId: values.campaignId,
        ownerId: values.ownerId,
        ownerType: values.ownerType,
        status: values.status,
        voucherCampaignId: values.voucherCampaignId || undefined,
      });
      if (result?.data) {
        setOpen(false);
        form.reset();
      }
    } catch {
      // error handled in useAddSpin's onError callback
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen} modal>
      <Sheet.Trigger asChild>
        <Button>
          <IconPlus />
          {t('add-spin', 'Add Spin')}
        </Button>
      </Sheet.Trigger>
      <Sheet.View className="sm:max-w-md">
        <Sheet.Header>
          <Sheet.Title>{t('add-spin', 'Add Spin')}</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="p-5">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              <Form.Field
                control={form.control}
                name="campaignId"
                rules={{ required: 'Campaign is required' }}
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('campaign-label', 'Campaign *')}</Form.Label>
                    <SelectSpinCampaign
                      value={field.value}
                      onValueChange={(val) => field.onChange(val as string)}
                      placeholder={t('select-campaign', 'Select campaign')}
                    />
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name="ownerType"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('owner-type', 'Owner Type')}</Form.Label>
                    <Form.Control>
                      <Select
                        value={field.value}
                        onValueChange={(val) => {
                          field.onChange(val);
                          form.setValue('ownerId', '');
                        }}
                      >
                        <Select.Trigger className="w-full">
                          <Select.Value />
                        </Select.Trigger>
                        <Select.Content>
                          <Select.Item value="customer">{t('customer', 'Customer')}</Select.Item>
                          <Select.Item value="company">{t('company', 'Company')}</Select.Item>
                          <Select.Item value="user">{t('user', 'User')}</Select.Item>
                          <Select.Item value="cpUser">{t('cp-user', 'Client Portal User')}</Select.Item>
                        </Select.Content>
                      </Select>
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name="ownerId"
                rules={{ required: 'Owner is required' }}
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('owner-label', 'Owner *')}</Form.Label>
                    <Form.Control>
                      <SelectOwnerByType
                        ownerType={ownerType}
                        value={field.value}
                        onValueChange={field.onChange}
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name="status"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('status', 'Status')}</Form.Label>
                    <Form.Control>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <Select.Trigger className="w-full">
                          <Select.Value />
                        </Select.Trigger>
                        <Select.Content>
                          <Select.Item value="new">{t('new', 'New')}</Select.Item>
                          <Select.Item value="loss">{t('loss', 'Loss')}</Select.Item>
                          <Select.Item value="won">{t('won', 'Won')}</Select.Item>
                        </Select.Content>
                      </Select>
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name="voucherCampaignId"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('voucher-campaign', 'Voucher Campaign')}</Form.Label>
                    <SelectVoucherCampaign.FormItem
                      value={field.value}
                      onValueChange={(val) => field.onChange(val as string)}
                      placeholder={t('choose-voucher-campaign', 'Choose voucher campaign')}
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
                  {t('cancel', 'Cancel')}
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? t('creating', 'Creating...') : t('save', 'Save')}
                </Button>
              </div>
            </form>
          </Form>
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
};
