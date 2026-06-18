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
} from 'erxes-ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSafeRemainderAdd } from '../hooks/useSafeRemainderAdd';
import { TSafeRemainderForm } from '../types/safeRemainderForm';
import { safeRemainderSchema } from '../types/safeRemainderSchema';
import { SelectBranches, SelectCategory, SelectDepartments } from 'ui-modules';

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
      <AccountingDialog
        title="Create Adjust Inventory"
        description="Adjust inventory for a specific branch, department, and category"
      >
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
    return {};
  };

  return (
    <Form {...form}>
      <form
        className="flex flex-col flex-auto overflow-auto"
        onSubmit={form.handleSubmit(onSubmit, onError)}
      >
        <div className="p-6 space-y-4">
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

          <div className="grid grid-cols-2 gap-4">
            <Form.Field
              control={form.control}
              name="branchId"
              render={({ field }) => (
                <Form.Item>
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
                <Form.Item>
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
          </div>

          <Form.Field
            control={form.control}
            name="productCategoryId"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Product Category</Form.Label>
                <SelectCategory
                  selected={field.value}
                  onSelect={field.onChange}
                />
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
                    rows={3}
                    {...field}
                  />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
        </div>

        <Dialog.Footer className="px-6 py-4 border-t bg-muted/30">
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
