import { IconPlus } from '@tabler/icons-react';
import { Button, Form, Sheet, Select } from 'erxes-ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAddLottery } from '../hooks/useAddLottery';
import { SelectCustomer } from 'ui-modules';
import { SelectCompany } from 'ui-modules/modules/contacts/components/SelectCompany';
import { SelectLotteryCampaign } from './selects/SelectLotteryCampaign';
import { SelectVoucherCampaign } from '../../vouchers/components/selects/SelectVoucherCampaign';

interface LotteryAddFormValues {
  campaignId: string;
  ownerId: string;
  ownerType: string;
  status: string;
  voucherCampaignId: string;
}

export const LotteryAddSheet = () => {
  const [open, setOpen] = useState(false);
  const { lotteryAdd, loading } = useAddLottery();

  const form = useForm<LotteryAddFormValues>({
    defaultValues: {
      campaignId: '',
      ownerId: '',
      ownerType: 'customer',
      status: 'new',
      voucherCampaignId: '',
    },
  });

  const ownerType = form.watch('ownerType');

  const onSubmit = async (values: LotteryAddFormValues) => {
    try {
      const result = await lotteryAdd({
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
      // error handled in useAddLottery's onError callback
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen} modal>
      <Sheet.Trigger asChild>
        <Button>
          <IconPlus />
          Add Lottery
        </Button>
      </Sheet.Trigger>
      <Sheet.View className="sm:max-w-md">
        <Sheet.Header>
          <Sheet.Title>Add Lottery</Sheet.Title>
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
                    <SelectLotteryCampaign
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
                          <Select.Item value="user">Team Members</Select.Item>
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
                    <Form.Label>Status</Form.Label>
                    <Form.Control>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <Select.Trigger className="w-full">
                          <Select.Value />
                        </Select.Trigger>
                        <Select.Content>
                          <Select.Item value="new">New</Select.Item>
                          <Select.Item value="loss">Loss</Select.Item>
                          <Select.Item value="won">Won</Select.Item>
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
                    <Form.Label>Voucher Campaign</Form.Label>
                    <SelectVoucherCampaign.FormItem
                      value={field.value}
                      onValueChange={(val) => field.onChange(val as string)}
                      placeholder="Choose voucher campaign"
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
