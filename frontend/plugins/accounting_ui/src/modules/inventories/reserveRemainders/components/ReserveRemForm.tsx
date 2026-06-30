import { zodResolver } from '@hookform/resolvers/zod';
import { IconPlus } from '@tabler/icons-react';
import { Button, Form, Input, ScrollArea, Sheet, Spinner } from 'erxes-ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  SelectBranches,
  SelectCategory,
  SelectDepartments,
  SelectProduct,
} from 'ui-modules';
import { useReserveRemAdd } from '../hooks/useReserveRemAdd';
import { reserveRemSchema, TReserveRemForm } from '../types/reserveRemForm';

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
      <Sheet.View className="p-0 flex flex-col gap-0 transition-all duration-100 ease-out overflow-hidden flex-none">
        <Sheet.Header className="flex-row gap-3 items-center p-3 space-y-0 border-b">
          <Sheet.Title>{t('add-reserve-remainder')}</Sheet.Title>
          <Sheet.Close />
          <Sheet.Description className="sr-only">
            {t('set-reserve-remainder-for-products')}
          </Sheet.Description>
        </Sheet.Header>
        <Sheet.Content className="overflow-hidden flex-auto">
          <ScrollArea className="h-full">
            <AddReserveRemForm setOpen={setOpen} />
          </ScrollArea>
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
};

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
        className="flex flex-col flex-auto overflow-auto"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="p-5 space-y-4">
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

          <Form.Field
            control={form.control}
            name="remainder"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('reserve-remainder')}</Form.Label>
                <Form.Control>
                  <Input
                    type="number"
                    value={field.value ?? ''}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === ''
                          ? undefined
                          : Number(e.target.value),
                      )
                    }
                  />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
        </div>

        <Sheet.Footer className="p-5 border-t bg-muted/30">
          <Sheet.Close asChild>
            <Button variant="outline" type="button" size="lg">
              {t('cancel')}
            </Button>
          </Sheet.Close>
          <Button type="submit" size="lg" disabled={loading}>
            {loading && <Spinner />}
            {t('save')}
          </Button>
        </Sheet.Footer>
      </form>
    </Form>
  );
};
