import { IconPlus } from '@tabler/icons-react';
import { Button, Form, Sheet, Select } from 'erxes-ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAddVoucher } from '../hooks/useAddVoucher';
import { SelectCustomer, SelectTags } from 'ui-modules';
import { SelectCompany } from 'ui-modules/modules/contacts/components/SelectCompany';
import { SelectVoucherCampaign } from './selects/SelectVoucherCampaign';

interface VoucherAddFormValues {
  campaignId: string;
  ownerIds: string[];
  ownerType: string;
  tagIds: string[];
}

export const VoucherAddSheet = () => {
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
          Add Voucher
        </Button>
      </Sheet.Trigger>
      <Sheet.View className="sm:max-w-md">
        <Sheet.Header>
          <Sheet.Title>Add Voucher</Sheet.Title>
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
                    <Form.Label>Voucher Campaign *</Form.Label>
                    <SelectVoucherCampaign
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
                          form.setValue('ownerIds', []);
                          form.setValue('tagIds', []);
                        }}
                      >
                        <Select.Trigger className="w-full">
                          <Select.Value />
                        </Select.Trigger>
                        <Select.Content>
                          <Select.Item value="customer">Customer</Select.Item>
                          <Select.Item value="company">Company</Select.Item>
                          <Select.Item value="user">Team Members</Select.Item>
                          <Select.Item value="cpUser">
                            Client Portal User
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
                      <Form.Label>Tag</Form.Label>
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
                    v.length > 0 || 'At least one owner is required',
                }}
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Owner *</Form.Label>
                    <Form.Control>
                      {ownerType === 'company' ? (
                        <SelectCompany
                          value={field.value}
                          onValueChange={(val) =>
                            field.onChange(
                              Array.isArray(val) ? val : val ? [val] : [],
                            )
                          }
                          mode="multiple"
                        />
                      ) : (
                        <SelectCustomer
                          value={field.value}
                          onValueChange={(val) =>
                            field.onChange(
                              Array.isArray(val) ? val : val ? [val] : [],
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
