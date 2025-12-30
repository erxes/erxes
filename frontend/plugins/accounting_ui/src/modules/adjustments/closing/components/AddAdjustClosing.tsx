import { IconPlus } from '@tabler/icons-react';
import {
  Button,
  DatePicker,
  Dialog,
  Form,
  Input,
  Textarea,
  useQueryState,
} from 'erxes-ui';
import { useState } from 'react';
import { TAdjustClosingForm } from '../types/adjustClosingForm';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { adjustClosingSchema } from '../types/adjustClosingSchema';
import { useAdjustClosing } from '../hooks/useAdjustClosing';
import { AccountingDialog } from '~/modules/layout/components/Dialog';

export const AddAdjustClosing = () => {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button>
          <IconPlus />
          Add Closing Adjustment
        </Button>
      </Dialog.Trigger>
      <AccountingDialog title="Add Acount" description="Add a new account">
        <AddAdjustClosingForm setOpen={setOpen} />
      </AccountingDialog>
    </Dialog>
  );
};

const AddAdjustClosingForm = ({
  setOpen,
}: {
  setOpen: (open: boolean) => void;
}) => {
  const form = useForm<TAdjustClosingForm>({
    resolver: zodResolver(adjustClosingSchema),
    defaultValues: { date: new Date() },
  });
  const { adjustClosing, loading } = useAdjustClosing();
  const [id] = useQueryState<string>('id');
  const onSubmit = (data: TAdjustClosingForm) => {
    adjustClosing({
      variables: { ...data },
      onCompleted: () => {
        setOpen(false);
        form.reset();
      },
    });
  };
  const onError = (error: any) => {
    console.log(error);
  };

  return (
    <Form {...form}>
      <form
        className="p-6 flex-auto overflow-auto"
        onSubmit={form.handleSubmit(onSubmit, onError)}
      >
        {' '}
        <h3 className="text-lg font-bold">
          {id ? `Edit` : `Create`} Adjust Inventory
        </h3>
        <Form.Field
          control={form.control}
          name="date"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Date</Form.Label>
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
          name="beginDate"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Begin date</Form.Label>
              <Form.Control>
                <DatePicker
                  value={field.value ?? undefined}
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
          name="description"
          render={({ field }) => (
            <Form.Item className="col-span-2">
              <Form.Label>Description</Form.Label>
              <Form.Control>
                <Textarea placeholder="Enter description" {...field} />
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
              <Form.Label>Integrate account</Form.Label>
              <Form.Control>
                <Input
                  placeholder="Integrate account ID"
                  {...field}
                  value={field.value ?? ''}
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="periodGLAccountId"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Period GL account</Form.Label>
              <Form.Control>
                <Input
                  placeholder="Period GL account ID"
                  {...field}
                  value={field.value ?? ''}
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
              <Form.Label>Earning account</Form.Label>
              <Form.Control>
                <Input
                  placeholder="Earning account ID"
                  {...field}
                  value={field.value ?? ''}
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="taxPayableaccountId"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Tax payable account</Form.Label>
              <Form.Control>
                <Input
                  placeholder="Tax payable account ID"
                  value={field.value ?? ''}
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
      </form>
    </Form>
  );
};
