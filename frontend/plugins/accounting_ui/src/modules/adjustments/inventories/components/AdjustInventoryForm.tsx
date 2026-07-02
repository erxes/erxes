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
import { useTranslation } from 'react-i18next';
import { useAdjustInventoryAdd } from '../hooks/useAdjustInventoryAdd';
import { TAdjustInventoryForm } from '../types/adjustInventoryForm';
import { adjustInventorySchema } from '../types/adjustInventorySchema';

export const AddAdjustInventory = () => {
  const { t } = useTranslation('accounting');
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button>
          <IconPlus />
          {t('add-inventory-adjustment')}
        </Button>
      </Dialog.Trigger>
      <AccountingDialog title={t('add-account')} description={t('add-a-new-account')}>
        <AddAdjustInventoryForm setOpen={setOpen} />
      </AccountingDialog>
    </Dialog>
  );
};

const AddAdjustInventoryForm = ({
  setOpen,
}: {
  setOpen: (open: boolean) => void;
}) => {
  const { t } = useTranslation('accounting');
  const form = useForm<TAdjustInventoryForm>({
    resolver: zodResolver(adjustInventorySchema),
    defaultValues: {
      date: new Date(),
    },
  });
  const { addAdjustInventory, loading } = useAdjustInventoryAdd();
  const [id] = useQueryState<string>('id');
  const onSubmit = (data: TAdjustInventoryForm) => {
    addAdjustInventory({
      variables: { ...data },
      onCompleted: () => {
        setOpen(false);
        form.reset();
      },
    });
  };

  const onError = (error: any) => {};

  return (
    <Form {...form}>
      <form
        className="p-6 flex-auto overflow-auto"
        onSubmit={form.handleSubmit(onSubmit, onError)}
      >
        <h3 className="text-lg font-bold">
          {`${id ? t('edit') : t('create')} ${t('adjust-inventory')}`}
        </h3>
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
            </Form.Item>
          )}
        />

        <Form.Field
          control={form.control}
          name="description"
          render={({ field }) => (
            <Form.Item className="col-span-2">
              <Form.Label>{t('description')}</Form.Label>
              <Form.Control>
                <Textarea placeholder={t('enter-description')} {...field} />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />

        <Dialog.Footer className="col-span-2 mt-4">
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
