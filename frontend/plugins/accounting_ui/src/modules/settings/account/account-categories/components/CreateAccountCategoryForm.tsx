import { zodResolver } from '@hookform/resolvers/zod';
import { IconChevronLeft } from '@tabler/icons-react';
import { Button, Form, Input, Separator, Spinner, toast } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { accountCategorySchema } from '@/settings/account/account-categories/constants/accountCategorySchema';
import { useAccountCategoryAdd } from '@/settings/account/account-categories/hooks/useAccountCategoryAdd';
import { TAccountCategoryForm } from '@/settings/account/account-categories/types/AccountCategory';
import { SelectAccountCategory } from '@/settings/account/account-categories/components/SelectAccountCategory';

export const CreateAccountCategoryForm = ({
  name,
  onBack,
  onCreated,
}: {
  name: string;
  onBack: () => void;
  onCreated: (categoryId: string) => void;
}) => {
  const { t } = useTranslation('accounting');
  const form = useForm<TAccountCategoryForm>({
    resolver: zodResolver(accountCategorySchema),
    defaultValues: { name, code: '' },
  });
  const { addAccountCategory, loading } = useAccountCategoryAdd();

  const onSubmit = (data: TAccountCategoryForm) => {
    addAccountCategory({
      variables: data,
      onCompleted: ({ accountCategoriesAdd }) => {
        toast({ title: t('success'), variant: 'success' });
        if (accountCategoriesAdd) {
          onCreated(accountCategoriesAdd._id);
        }
      },
      onError: (error) => {
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.stopPropagation();
    form.handleSubmit(onSubmit)(event);
  };

  return (
    <div className="overflow-auto">
      <div className="flex items-center p-1 font-medium">
        <Button variant="ghost" className="gap-1 pl-1" onClick={onBack}>
          <IconChevronLeft />
          {t('add-account-category')}
        </Button>
      </div>
      <Separator />
      <Form {...form}>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-3 p-3">
            <Form.Field
              control={form.control}
              name="name"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('name')}</Form.Label>
                  <Form.Control>
                    <Input {...field} />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="code"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('code')}</Form.Label>
                  <Form.Control>
                    <Input {...field} autoFocus />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="parentId"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('parent')}</Form.Label>
                  <Form.Control>
                    <SelectAccountCategory
                      recordId="create-account-category-parent"
                      selected={field.value}
                      onSelect={(categoryId) =>
                        field.onChange(categoryId ?? undefined)
                      }
                      nullable
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
          </div>
          <Separator />
          <div className="p-3">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Spinner /> : t('create')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
