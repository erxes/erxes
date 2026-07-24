import { Button, Form, Sheet } from 'erxes-ui';
import {
  RemainderFormField,
  ReserveRemFormFooter,
} from './ReserveRemFormParts';
import {
  SelectBranches,
  SelectCategory,
  SelectDepartments,
  SelectProduct,
} from 'ui-modules';
import { TReserveRemForm, reserveRemSchema } from '../types/reserveRemForm';

import { AccountingSheet } from '~/modules/layout/components/Sheet';
import { IconPlus } from '@tabler/icons-react';
import { useForm } from 'react-hook-form';
import { useReserveRemAdd } from '../hooks/useReserveRemAdd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';

const AddReserveRemForm = ({
  setOpen,
}: {
  setOpen: (open: boolean) => void;
}) => {
  const { t } = useTranslation('accounting');
  const form = useForm<TReserveRemForm>({
    resolver: zodResolver(reserveRemSchema),
    defaultValues: {
      branchIds: [],
      departmentIds: [],
      remainder: 0,
    },
  });

  const { addReserveRem, loading } = useReserveRemAdd();

  const onSubmit = (data: TReserveRemForm) => {
    addReserveRem({
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
        className="flex flex-col flex-1 bg-background min-h-0"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="p-5 min-h-0 flex-1 overflow-y-auto space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Form.Field
              control={form.control}
              name="branchIds"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('branch')}</Form.Label>
                  <SelectBranches.FormItem
                    mode="multiple"
                    value={field.value}
                    onValueChange={field.onChange}
                  />
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="departmentIds"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('department')}</Form.Label>
                  <SelectDepartments.FormItem
                    mode="multiple"
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
            name="productId"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('product')}</Form.Label>
                <SelectProduct.FormItem
                  mode="single"
                  value={field.value}
                  onValueChange={field.onChange}
                />
                <Form.Message />
              </Form.Item>
            )}
          />

          <RemainderFormField control={form.control} />
        </div>

        <ReserveRemFormFooter loading={loading} />
      </form>
    </Form>
  );
};

export const AddReserveRem = () => {
  const { t } = useTranslation('accounting');
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Sheet.Trigger asChild>
        <Button>
          <IconPlus />
          {t('add-reserve-remainder')}
        </Button>
      </Sheet.Trigger>
      <AccountingSheet title={t('add-reserve-remainder')}>
        <AddReserveRemForm setOpen={setOpen} />
      </AccountingSheet>
    </Sheet>
  );
};
