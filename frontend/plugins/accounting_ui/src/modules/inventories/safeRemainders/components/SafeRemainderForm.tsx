import { AccountingDialog } from '@/layout/components/Dialog';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconPlus } from '@tabler/icons-react';
import {
  Button,
  DatePicker,
  Dialog,
  Form,
  Spinner,
  Textarea,
  useQueryState,
} from 'erxes-ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSafeRemainderAdd } from '../hooks/useSafeRemainderAdd';
import { TSafeRemainderForm } from '../types/safeRemainderForm';
import { safeRemainderSchema } from '../types/safeRemainderSchema';
import { SelectBranches, SelectDepartments } from 'ui-modules';

export const AddSafeRemainder = () => {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button>
          <IconPlus />
          Add Safe Remainder
        </Button>
      </Dialog.Trigger>
      <AccountingDialog title="Add Account" description="Add a new account">
        <AddSafeRemainderForm setOpen={setOpen} />
      </AccountingDialog>
    </Dialog>
  );
};

const AddSafeRemainderForm = ({
  setOpen,
}: {
  setOpen: (open: boolean) => void;
}) => {
  const form = useForm<TSafeRemainderForm>({
    resolver: zodResolver(safeRemainderSchema),
    defaultValues: {
      date: new Date(),
    },
  });
  const { addSafeRemainder, loading } = useSafeRemainderAdd();
  const [id] = useQueryState<string>('id');
  const onSubmit = (data: TSafeRemainderForm) => {
    addSafeRemainder({
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
          name="branchId"
          render={({ field }) => (
            <Form.Item className="col-span-2">
              <Form.Label>Branch</Form.Label>
              <SelectBranches.FormItem
                mode="single"
                value={field.value}
                onValueChange={field.onChange}
              />
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="departmentId"
          render={({ field }) => (
            <Form.Item className="col-span-2">
              <Form.Label>Department</Form.Label>
              <SelectDepartments.FormItem
                mode="single"
                value={field.value}
                onValueChange={field.onChange}
              />
              <Form.Message />
            </Form.Item>
          )}
        />

        <Dialog.Footer className="col-span-2 mt-4">
          <Dialog.Close asChild>
            <Button variant="outline" type="button" size="lg">
              Cancel
            </Button>
          </Dialog.Close>
          <Button type="submit" size="lg" disabled={loading}>
            {loading && <Spinner />}
            Save
          </Button>
        </Dialog.Footer>
      </form>
    </Form>
  );
};
