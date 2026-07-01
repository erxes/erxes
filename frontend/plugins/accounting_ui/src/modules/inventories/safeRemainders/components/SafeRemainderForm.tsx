import { AccountingSheet } from '~/modules/layout/components/Sheet';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconPlus } from '@tabler/icons-react';
import { Button, DatePicker, Form, Sheet, Spinner, Textarea } from 'erxes-ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSafeRemainderAdd } from '../hooks/useSafeRemainderAdd';
import { TSafeRemainderForm } from '../types/safeRemainderForm';
import { safeRemainderSchema } from '../types/safeRemainderSchema';
import { SelectBranches, SelectCategory, SelectDepartments } from 'ui-modules';

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
        className="flex flex-col flex-1 min-h-0 bg-background"
        onSubmit={form.handleSubmit(onSubmit, onError)}
      >
        <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-4">
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

        <Sheet.Footer className="px-5 py-4 border-t bg-background shrink-0">
          <Button
            variant="outline"
            type="button"
            size="lg"
            onClick={() => setOpen(false)}
          >
            {t('cancel')}
          </Button>
          <Button type="submit" size="lg" disabled={loading}>
            {loading && <Spinner />}
            {t('save')}
          </Button>
        </Sheet.Footer>
      </form>
    </Form>
  );
};

export const AddSafeRemainder = () => {
  const { t } = useTranslation('accounting');
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen} modal>
      <Sheet.Trigger asChild>
        <Button>
          <IconPlus />
          {t('add-safe-remainder')}
        </Button>
      </Sheet.Trigger>
      <AccountingSheet title={t('add-safe-remainder')}>
        <AddSafeRemainderForm setOpen={setOpen} />
      </AccountingSheet>
    </Sheet>
  );
};
