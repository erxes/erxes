import { IconPlus } from '@tabler/icons-react';
import { Button, Form, Sheet, Select } from 'erxes-ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useAddVoucher } from '../hooks/useAddVoucher';
import { SelectCustomer, SelectTags } from 'ui-modules';
import { SelectCompany } from 'ui-modules/modules/contacts/components/SelectCompany';
import { SelectVoucherCampaign } from './selects/SelectVoucherCampaign';

const toStringArray = (val: unknown): string[] => {
  if (Array.isArray(val)) return val;
  if (val) return [val as string];
  return [];
};

interface VoucherAddFormValues {
  campaignId: string;
  ownerIds: string[];
  ownerType: string;
  tagIds: string[];
}

export const VoucherAddSheet = () => {
  const { t } = useTranslation('loyalty');
  const [open, setOpen] = useState(false);
  const { voucherAdd, loading } = useAddVoucher();

  const form = useForm<VoucherAddFormValues>({
    defaultValues: {
      campaignId: '',
      ownerIds: [],
      ownerType: 'customer',
      tagIds: [],
    },
  });

  const ownerType = form.watch('ownerType');

  const onSubmit = async (values: VoucherAddFormValues) => {
    try {
      const result = await voucherAdd({
        campaignId: values.campaignId,
        ownerIds: values.ownerIds,
        ownerType: values.ownerType,
        // tagIds only sent when ownerIds is also present — backend does intersection, no bulk creation
        tagIds:
          ownerType === 'customer' && values.tagIds.length > 0
            ? values.tagIds
            : [],
        status: 'active',
      });
      if (result?.data) {
        setOpen(false);
        form.reset();
      }
    } catch {
      // error handled in useAddVoucher's onError callback
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen} modal>
      <Sheet.Trigger asChild>
        <Button>
          <IconPlus />
          {t('add-voucher')}
        </Button>
      </Sheet.Trigger>
      <Sheet.View className="sm:max-w-md">
        <Sheet.Header>
          <Sheet.Title>{t('add-voucher')}</Sheet.Title>
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
                    <Form.Label>{t('voucher-campaign-label')}</Form.Label>
                    <SelectVoucherCampaign
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
                          form.setValue('ownerIds', []);
                          form.setValue('tagIds', []);
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

              {ownerType === 'customer' && (
                <Form.Field
                  control={form.control}
                  name="tagIds"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>{t('tag')}</Form.Label>
                      <Form.Control>
                        <SelectTags
                          tagType="core:customer"
                          mode="multiple"
                          value={field.value}
                          onValueChange={(val) =>
                            field.onChange(val as string[])
                          }
                          targetIds={undefined}
                        />
                      </Form.Control>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
              )}

              <Form.Field
                control={form.control}
                name="ownerIds"
                rules={{
                  validate: (v) =>
                    v.length > 0 || t('owner-required-one'),
                }}
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('owner-label')}</Form.Label>
                    <Form.Control>
                      {ownerType === 'company' ? (
                        <SelectCompany
                          value={field.value}
                          onValueChange={(val) =>
                            field.onChange(toStringArray(val))
                          }
                          mode="multiple"
                        />
                      ) : (
                        <SelectCustomer
                          value={field.value}
                          onValueChange={(val) =>
                            field.onChange(toStringArray(val))
                          }
                          mode="multiple"
                        />
                      )}
                    </Form.Control>
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
                  {t('cancel')}
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? t('creating') : t('save')}
                </Button>
              </div>
            </form>
          </Form>
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
};
