import { IconPlus } from '@tabler/icons-react';
import { Button, DatePicker, Form, Sheet, Spinner, Textarea } from 'erxes-ui';
import { useState } from 'react';
import { TAdjustClosingForm } from '../types/adjustClosingForm';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { adjustClosingSchema } from '../types/adjustClosingSchema';
import { useAdjustClosingAdd } from '../hooks/useAdjustClosingAdd';
import { SelectAccountFormItem } from '~/modules/settings/account/components/SelectAccount';
import { AccountingSheet } from '~/modules/layout/components/Sheet';

export const AddAdjustClosing = () => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen} modal>
      <Sheet.Trigger asChild>
        <Button>
          <IconPlus />
          Add Closing Adjustment
        </Button>
      </Sheet.Trigger>

      <AccountingSheet title="Create Closing Adjustment">
        <AddAdjustClosingForm setOpen={setOpen} />
      </AccountingSheet>
    </Sheet>
  );
};

export const AddAdjustClosingForm = ({
  setOpen,
}: {
  setOpen: (open: boolean) => void;
}) => {
  const form = useForm<TAdjustClosingForm>({
    resolver: zodResolver(adjustClosingSchema),
    defaultValues: { date: new Date() },
  });

  const { addAdjustClosing, loading } = useAdjustClosingAdd();

  const onSubmit = (data: TAdjustClosingForm) => {
    addAdjustClosing({
      variables: { ...data },
      onCompleted: () => {
        setOpen(false);
        form.reset();
      },
    });
  };

  return (
    <Form {...form}>
      <form
        className="flex flex-col flex-1 min-h-0 bg-background"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-4">
          <Form.Field
            control={form.control}
            name="date"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>
                  Date <span className="text-destructive">*</span>
                </Form.Label>
                <Form.Control>
                  <DatePicker
                    value={field.value}
                    onChange={field.onChange}
                    className="h-8 flex w-full"
                  />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />

          <Form.Field
            control={form.control}
            name="integrateAccountId"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>
                  Integrate account <span className="text-destructive">*</span>
                </Form.Label>
                <SelectAccountFormItem
                  value={field.value ?? undefined}
                  onValueChange={field.onChange}
                  placeholder="Integrate account ID"
                />
                <Form.Message />
              </Form.Item>
            )}
          />

          <Form.Field
            control={form.control}
            name="periodGLAccountId"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>
                  Period GL account <span className="text-destructive">*</span>
                </Form.Label>
                <Form.Control>
                  <SelectAccountFormItem
                    value={field.value ?? undefined}
                    onValueChange={field.onChange}
                    placeholder="Period GL account ID"
                  />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />

          <Form.Field
            control={form.control}
            name="earningAccountId"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>
                  Earning account <span className="text-destructive">*</span>
                </Form.Label>
                <Form.Control>
                  <SelectAccountFormItem
                    value={field.value ?? undefined}
                    onValueChange={field.onChange}
                    placeholder="Earning account ID"
                  />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />

          <Form.Field
            control={form.control}
            name="taxPayableAccountId"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>
                  Tax payable account{' '}
                  <span className="text-destructive">*</span>
                </Form.Label>
                <Form.Control>
                  <SelectAccountFormItem
                    value={field.value ?? undefined}
                    onValueChange={field.onChange}
                    placeholder="Tax Payable account ID"
                  />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />

          <Form.Field
            control={form.control}
            name="description"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Description</Form.Label>
                <Form.Control>
                  <Textarea
                    placeholder="Enter description"
                    value={field.value || ''}
                    onChange={field.onChange}
                  />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
        </div>

        <Sheet.Footer className="px-5 border-t bg-background shrink-0">
          <Button
            variant="outline"
            type="button"
            size="lg"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>

          <Button type="submit" size="lg" disabled={loading}>
            {loading && <Spinner />}
            Save
          </Button>
        </Sheet.Footer>
      </form>
    </Form>
  );
};
