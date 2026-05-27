import { Button, Form, Input, Sheet, Select } from 'erxes-ui';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useEditDonate } from '../hooks/useEditDonate';
import { SelectCustomer, SelectMember } from 'ui-modules';
import { SelectCompany } from 'ui-modules/modules/contacts/components/SelectCompany';
import { IDonate } from '../types/donate';
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

interface DonateEditFormValues {
  campaignId: string;
  ownerId: string;
  ownerType: string;
  status: string;
  voucherCampaignId: string;
  donateScore: string;
}

interface DonateEditSheetProps {
  donate: IDonate;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DonateEditSheet = ({
  donate,
  open,
  onOpenChange,
}: DonateEditSheetProps) => {
  const { donateEdit, loading } = useEditDonate();

  const form = useForm<DonateEditFormValues>({
    defaultValues: {
      campaignId: donate.campaignId || '',
      ownerId: donate.ownerId || '',
      ownerType: donate.ownerType || 'customer',
      status: donate.status || 'new',
      voucherCampaignId: donate.voucherCampaignId || '',
      donateScore: donate.donateScore ? String(donate.donateScore) : '',
    },
  });

  const { reset, setValue, watch } = form;
  const ownerType = watch('ownerType');

  useEffect(() => {
    if (open) {
      reset({
        campaignId: donate.campaignId || '',
        ownerId: donate.ownerId || '',
        ownerType: donate.ownerType || 'customer',
        status: donate.status || 'new',
        voucherCampaignId: donate.voucherCampaignId || '',
        donateScore: donate.donateScore ? String(donate.donateScore) : '',
      });
    }
  }, [open, donate, reset]);

  const onSubmit = async (values: DonateEditFormValues) => {
    try {
      const result = await donateEdit({
        _id: donate._id,
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
        onOpenChange(false);
      }
    } catch {
      // error handled in useEditDonate's onError callback
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange} modal>
      <Sheet.View className="sm:max-w-md">
        <Sheet.Header>
          <Sheet.Title>Edit Donation</Sheet.Title>
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
                    <Form.Label>Campaign *</Form.Label>
                    <SelectDonateCampaign.FormItem
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select campaign..."
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
                    <Form.Label>Owner Type</Form.Label>
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
                          <Select.Item value="customer">Customer</Select.Item>
                          <Select.Item value="company">Company</Select.Item>
                          <Select.Item value="user">User</Select.Item>
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
                    <Form.Label>Owner *</Form.Label>
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
                    <Form.Label>Donate Score</Form.Label>
                    <Form.Control>
                      <Input
                        type="number"
                        min={0}
                        placeholder="Enter donate score"
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
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </form>
          </Form>
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
};
