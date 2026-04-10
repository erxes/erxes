import { IconPlus } from '@tabler/icons-react';
import { Button, Form, Input, Sheet, Select } from 'erxes-ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
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
    return <SelectCompany value={value} onValueChange={onChange} mode="single" />;
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
  return <SelectCustomer value={value} onValueChange={onChange} mode="single" />;
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
          Add Donation
        </Button>
      </Sheet.Trigger>
      <Sheet.View className="sm:max-w-md">
        <Sheet.Header>
          <Sheet.Title>Add Donation</Sheet.Title>
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
                      onValueChange={(val) => field.onChange(val as string)}
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
                          form.setValue('ownerId', '');
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
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Save'}
                </Button>
              </div>
            </form>
          </Form>
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
};
