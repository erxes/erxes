import { Button, Form, Sheet, Select } from 'erxes-ui';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useEditSpin } from '../hooks/useEditSpin';
import { SelectOwnerByType } from '../../scores/components/selects/SelectOwnerByType';
import { ISpin } from '../types/spin';
import { SelectSpinCampaign } from './selects/SelectSpinCampaign';
import { SelectVoucherCampaign } from '../../vouchers/components/selects/SelectVoucherCampaign';

interface SpinEditFormValues {
  campaignId: string;
  ownerId: string;
  ownerType: string;
  status: string;
  voucherCampaignId: string;
}

interface SpinEditSheetProps {
  spin: ISpin;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SpinEditSheet = ({
  spin,
  open,
  onOpenChange,
}: SpinEditSheetProps) => {
  const { t } = useTranslation('loyalty');
  const { spinEdit, loading } = useEditSpin();

  const form = useForm<SpinEditFormValues>({
    defaultValues: {
      campaignId: spin.campaignId || '',
      ownerId: spin.ownerId || '',
      ownerType: spin.ownerType || 'customer',
      status: spin.status || 'new',
      voucherCampaignId: spin.voucherCampaignId || '',
    },
  });

  const { reset, setValue, watch } = form;
  const ownerType = watch('ownerType');

  useEffect(() => {
    if (open) {
      reset({
        campaignId: spin.campaignId || '',
        ownerId: spin.ownerId || '',
        ownerType: spin.ownerType || 'customer',
        status: spin.status || 'new',
        voucherCampaignId: spin.voucherCampaignId || '',
      });
    }
  }, [open, spin, reset]);

  const onSubmit = async (values: SpinEditFormValues) => {
    try {
      const result = await spinEdit({
        _id: spin._id,
        campaignId: values.campaignId,
        ownerId: values.ownerId,
        ownerType: values.ownerType,
        status: values.status,
        voucherCampaignId: values.voucherCampaignId || undefined,
      });
      if (result?.data) {
        onOpenChange(false);
      }
    } catch {
      // error handled in useEditSpin's onError callback
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange} modal>
      <Sheet.View className="sm:max-w-md">
        <Sheet.Header>
          <Sheet.Title>{t('edit-spin')}</Sheet.Title>
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
                rules={{ required: t('campaign-required') }}
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('campaign-label')}</Form.Label>
                    <SelectSpinCampaign
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder={t('select-campaign')}
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
                    <Form.Label>{t('owner-type')}</Form.Label>
                    <Form.Control>
                      <Select
                        value={field.value}
                        onValueChange={(val) => {
                          field.onChange(val);
                          setValue('ownerId', '');
                        }}
                      >
                        <Select.Trigger className="w-full">
                          <Select.Value />
                        </Select.Trigger>
                        <Select.Content>
                          <Select.Item value="customer">{t('customer')}</Select.Item>
                          <Select.Item value="company">{t('company')}</Select.Item>
                          <Select.Item value="user">{t('user')}</Select.Item>
                          <Select.Item value="cpUser">
                            {t('cp-user')}
                          </Select.Item>
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
                rules={{ required: t('owner-required') }}
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('owner-label')}</Form.Label>
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
                    <Form.Label>{t('status')}</Form.Label>
                    <Form.Control>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <Select.Trigger className="w-full">
                          <Select.Value />
                        </Select.Trigger>
                        <Select.Content>
                          <Select.Item value="new">{t('new')}</Select.Item>
                          <Select.Item value="loss">{t('loss')}</Select.Item>
                          <Select.Item value="won">{t('won')}</Select.Item>
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
                    <Form.Label>{t('voucher-campaign')}</Form.Label>
                    <SelectVoucherCampaign.FormItem
                      value={field.value}
                      onValueChange={(val) => field.onChange(val as string)}
                      placeholder={t('choose-voucher-campaign')}
                    />
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  {t('cancel')}
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
