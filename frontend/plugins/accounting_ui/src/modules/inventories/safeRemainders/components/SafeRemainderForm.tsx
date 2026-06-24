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
import { useTranslation } from 'react-i18next';
import { useSafeRemainderAdd } from '../hooks/useSafeRemainderAdd';
import { TSafeRemainderForm } from '../types/safeRemainderForm';
import { safeRemainderSchema } from '../types/safeRemainderSchema';
import { SelectBranches, SelectCategory, SelectDepartments } from 'ui-modules';

export const AddSafeRemainder = () => {
  const { t } = useTranslation('accounting');
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button>
          <IconPlus />
          {t('add-safe-remainder')}
        </Button>
      </Dialog.Trigger>
      <AccountingDialog
        title={t('create-adjust-inventory')}
        description={t('adjust-inventory-description')}
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
  const { t } = useTranslation('accounting');
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
                <Form.Label>{t('date')}</Form.Label>
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
                  <Form.Label>{t('branch')}</Form.Label>
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
                  <Form.Label>{t('department')}</Form.Label>
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
                <Form.Label>{t('product-category')}</Form.Label>
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
                <Form.Label>{t('description')}</Form.Label>
                <Form.Control>
                  <Textarea
                    placeholder={t('enter-description')}
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
              {t('cancel')}
            </Button>
          </Dialog.Close>
          <Button type="submit" size="lg" disabled={loading}>
            {loading && <Spinner />}
            {t('save')}
          </Button>
        </Dialog.Footer>
      </form>
    </Form>
  );
};
