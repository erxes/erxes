import { Button, Form, Sheet, Select } from 'erxes-ui';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useEditLottery } from '../hooks/useEditLottery';
import { SelectCustomer } from 'ui-modules';
import { SelectCompany } from 'ui-modules/modules/contacts/components/SelectCompany';
import { ILottery } from '../types/lottery';
import { SelectLotteryCampaign } from './selects/SelectLotteryCampaign';
import { SelectVoucherCampaign } from '../../vouchers/components/selects/SelectVoucherCampaign';

interface LotteryEditFormValues {
  campaignId: string;
  ownerId: string;
  ownerType: string;
  status: string;
  voucherCampaignId: string;
}

interface LotteryEditSheetProps {
  lottery: ILottery;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LotteryEditSheet = ({
  lottery,
  open,
  onOpenChange,
}: LotteryEditSheetProps) => {
  const { t } = useTranslation('loyalty');
  const { lotteryEdit, loading } = useEditLottery();

  const form = useForm<LotteryEditFormValues>({
    defaultValues: {
      campaignId: lottery.campaignId || '',
      ownerId: lottery.ownerId || '',
      ownerType: lottery.ownerType || 'customer',
      status: lottery.status || 'new',
      voucherCampaignId: lottery.voucherCampaignId || '',
    },
  });

  const { reset, setValue, watch } = form;
  const ownerType = watch('ownerType');

  useEffect(() => {
    if (open) {
      reset({
        campaignId: lottery.campaignId || '',
        ownerId: lottery.ownerId || '',
        ownerType: lottery.ownerType || 'customer',
        status: lottery.status || 'new',
        voucherCampaignId: lottery.voucherCampaignId || '',
      });
    }
  }, [open, lottery, reset]);

  const onSubmit = async (values: LotteryEditFormValues) => {
    try {
      const result = await lotteryEdit({
        _id: lottery._id,
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
      // error handled in useEditLottery's onError callback
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange} modal>
      <Sheet.View className="sm:max-w-md">
        <Sheet.Header>
          <Sheet.Title>{t('edit-lottery')}</Sheet.Title>
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
                    <SelectLotteryCampaign
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
                          <Select.Item value="user">{t('team-members')}</Select.Item>
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
                      {ownerType === 'company' ? (
                        <SelectCompany
                          value={field.value}
                          onValueChange={(val) => field.onChange(val)}
                          mode="single"
                        />
                      ) : (
                        <SelectCustomer
                          value={field.value}
                          onValueChange={(val) => field.onChange(val)}
                          mode="single"
                        />
                      )}
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
                          <Select.Item value="active">{t('active')}</Select.Item>
                          <Select.Item value="used">{t('used')}</Select.Item>
                          <Select.Item value="expired">{t('expired')}</Select.Item>
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
