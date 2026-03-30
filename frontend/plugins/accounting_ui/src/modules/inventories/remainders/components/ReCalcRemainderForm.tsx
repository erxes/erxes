import { AccountingDialog } from '@/layout/components/Dialog';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconPlus } from '@tabler/icons-react';
import { Button, Dialog, Form, Spinner, useMultiQueryState } from 'erxes-ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { SelectBranches, SelectCategory, SelectDepartments } from 'ui-modules';
import { useReCalcRemainders } from '../hooks/useReCalcRemainders';
import { TReCalcRemainderForm } from '../types/reCalcRemainderForm';
import { reCalcRemainderSchema } from '../types/reCalcRemainderSchema';

export const ReCalcRemainderForm = () => {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button>
          <IconPlus />
          ReCalc Remainder
        </Button>
      </Dialog.Trigger>
      <AccountingDialog title="ReCalc Form" description="Add a new account">
        <ReCalcRemaindersForm setOpen={setOpen} />
      </AccountingDialog>
    </Dialog>
  );
};

const ReCalcRemaindersForm = ({
  setOpen,
}: {
  setOpen: (open: boolean) => void;
}) => {
  const [queries] = useMultiQueryState<{
    branchId?: string;
    departmentId?: string;
    categoryIds?: string[];
  }>([
    'branchId',
    'departmentId',
    'categoryIds',
  ]);

  const form = useForm<TReCalcRemainderForm>({
    resolver: zodResolver(reCalcRemainderSchema),
    defaultValues: {
      branchId: queries.branchId ?? '',
      departmentId: queries.departmentId ?? '',
    },
  });

  const { addSafeRemainder, loading } = useReCalcRemainders();
  const onSubmit = (data: TReCalcRemainderForm) => {
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
        className="p-6 flex-auto overflow-auto"
        onSubmit={form.handleSubmit(onSubmit, onError)}
      >
        <h3 className="text-lg font-bold">ReCalc Live remainder</h3>
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
        <Form.Field
          control={form.control}
          name="productCategoryId"
          render={({ field }) => (
            <Form.Item className="col-span-2">
              <Form.Label>Product Category</Form.Label>
              <SelectCategory
                selected={field.value}
                onSelect={field.onChange}
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
            RUN
          </Button>
        </Dialog.Footer>
      </form>
    </Form>
  );
};
