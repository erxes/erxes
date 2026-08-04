import { IconPlus } from '@tabler/icons-react';
import { Button, Form, Input, Sheet, Select } from 'erxes-ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useAddDonate } from '../hooks/useAddDonate';
import { SelectCustomer, SelectMember } from 'ui-modules';
import { SelectCompany } from 'ui-modules/modules/contacts/components/SelectCompany';
import { SelectDonateCampaign } from './selects/SelectDonateCampaign';

const DonateOwnerSelect = ({
  ownerType,
  value,
  onChange,
}: {
  ownerType: string;
  value: string;
  onChange: (val: string) => void;
}) => {
  if (ownerType === 'company') {
    return (
      <SelectCompany value={value} onValueChange={onChange} mode="single" />
    );
  }
  if (ownerType === 'user') {
    return (
      <SelectMember.FormItem
        value={value}
        onValueChange={(val) => onChange(val as string)}
        mode="single"
      />
    );
  }
  return (
    <SelectCustomer value={value} onValueChange={onChange} mode="single" />
  );
};

interface DonateAddFormValues {
  campaignId: string;
  ownerId: string;
  ownerType: string;
  status: string;
  voucherCampaignId: string;
  donateScore: string;
}

export const DonateAddSheet = () => {
  const [open, setOpen] = useState(false);
  const { donateAdd, loading } = useAddDonate();
  const { t } = useTranslation('loyalty');

  const form = useForm<DonateAddFormValues>({
    defaultValues: {
      campaignId: '',
      ownerId: '',
      ownerType: 'customer',
      status: 'new',
      voucherCampaignId: '',
      donateScore: '',
    },
  });

  const ownerType = form.watch('ownerType');

  const onSubmit = async (values: DonateAddFormValues) => {
    try {
      const result = await donateAdd({
        campaignId: values.campaignId,
        ownerId: values.ownerId,
        ownerType: values.ownerType,
        status: values.status,
        voucherCampaignId: values.voucherCampaignId || undefined,
        donateScore: values.donateScore
          ? Number(values.donateScore)
          : undefined,
      });
      if (result?.data) {
        setOpen(false);
        form.reset();
      }
    } catch {
      // error handled in useAddDonate's onError callback
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen} modal>
      <Sheet.Trigger asChild>
        <Button>
          <IconPlus />
          {t('add-donation')}
        </Button>
      </Sheet.Trigger>
      <Sheet.View className="sm:max-w-md">
        <Sheet.Header>
          <Sheet.Title>{t('add-donation')}</Sheet.Title>
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
                    <SelectDonateCampaign.FormItem
                      value={field.value}
                      onValueChange={(val) => field.onChange(val as string)}
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
                          form.setValue('ownerId', '');
                        }}
                      >
                        <Select.Trigger className="w-full">
                          <Select.Value />
                        </Select.Trigger>
                        <Select.Content>
                          <Select.Item value="customer">{t('customer')}</Select.Item>
                          <Select.Item value="company">{t('company')}</Select.Item>
                          <Select.Item value="user">{t('user')}</Select.Item>
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
                      <DonateOwnerSelect
                        ownerType={ownerType}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name="donateScore"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('donate-score')}</Form.Label>
                    <Form.Control>
                      <Input
                        type="number"
                        min={0}
                        placeholder={t('enter-donate-score')}
                        {...field}
                      />
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
