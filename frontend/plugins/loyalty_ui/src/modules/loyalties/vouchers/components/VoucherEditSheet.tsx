import { Button, Form, Sheet, Select } from 'erxes-ui';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useEditVoucher } from '../hooks/useEditVoucher';
import { SelectCustomer, useGiveTags } from 'ui-modules';
import { SelectCompany } from 'ui-modules/modules/contacts/components/SelectCompany';
import { IVoucher } from '../types/voucher';
import { SelectVoucherCampaign } from './selects/SelectVoucherCampaign';

interface VoucherEditFormValues {
  campaignId: string;
  ownerId: string;
  ownerType: string;
  status: string;
}

interface VoucherEditSheetProps {
  voucher: IVoucher;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const VoucherEditSheet = ({
  voucher,
  open,
  onOpenChange,
}: VoucherEditSheetProps) => {
  const { t } = useTranslation('loyalty');
  const { voucherEdit, loading } = useEditVoucher();
  const { giveTags } = useGiveTags();

  const form = useForm<VoucherEditFormValues>({
    defaultValues: {
      campaignId: voucher.campaignId || '',
      ownerId: voucher.ownerId || '',
      ownerType: voucher.ownerType || 'customer',
      status: voucher.status || 'new',
    },
  });

  const { reset, setValue, watch } = form;
  const ownerType = watch('ownerType');

  useEffect(() => {
    if (open) {
      reset({
        campaignId: voucher.campaignId || '',
        ownerId: voucher.ownerId || '',
        ownerType: voucher.ownerType || 'customer',
        status: voucher.status || 'new',
      });
    }
  }, [open, voucher, reset]);

  const onSubmit = async (values: VoucherEditFormValues) => {
    try {
      if (ownerType === 'customer' && values.ownerId) {
        await giveTags({
          variables: {
            targetIds: [values.ownerId],
            type: 'core:customer',
          },
        });
      }
      const result = await voucherEdit({
        _id: voucher._id,
        campaignId: values.campaignId,
        ownerId: values.ownerId,
        ownerType: values.ownerType,
        status: values.status,
      });
      if (result?.data) {
        onOpenChange(false);
      }
    } catch {
      // error handled in useEditVoucher's onError callback
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange} modal>
      <Sheet.View className="sm:max-w-md">
        <Sheet.Header>
          <Sheet.Title>{t('edit-voucher')}</Sheet.Title>
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
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('campaign')}</Form.Label>
                    <SelectVoucherCampaign
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder={t('choose-voucher-campaign')}
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
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('owner-label')}</Form.Label>
                    <Form.Control>
                      {ownerType === 'company' ? (
                        <SelectCompany
                          value={field.value ? [field.value] : []}
                          onValueChange={(val) =>
                            field.onChange(
                              Array.isArray(val) ? val[0] : val || '',
                            )
                          }
                          mode="multiple"
                        />
                      ) : (
                        <SelectCustomer
                          value={field.value ? [field.value] : []}
                          onValueChange={(val) =>
                            field.onChange(
                              Array.isArray(val) ? val[0] : val || '',
                            )
                          }
                          mode="multiple"
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
                    <Form.Label>{t('status-label')}</Form.Label>
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
                          <Select.Item value="used">{t('used')}</Select.Item>
                        </Select.Content>
                      </Select>
                    </Form.Control>
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
