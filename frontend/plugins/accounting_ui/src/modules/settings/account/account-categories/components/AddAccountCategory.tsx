import { Button, Sheet } from 'erxes-ui';
import { IconPlus } from '@tabler/icons-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { TAccountCategoryForm } from '../types/AccountCategory';
import { useForm } from 'react-hook-form';
import { accountCategorySchema } from '../constants/accountCategorySchema';
import { ACCOUNT_CATEGORY_DEFAULT_VALUES } from '../constants/accountCategoryDefaultValues';
import { AccountCategoryForm } from './AccountCategoryForm';
import { useAccountCategoryAdd } from '../hooks/useAccountCategoryAdd';
import { AccountingSheet } from '~/modules/layout/components/Sheet';

export const AddAccountCategory = () => {
  return (
    <Sheet>
      <Sheet.Trigger asChild>
        <Button>
          <IconPlus />
          Дансны ангилал нэмэх
        </Button>
      </Sheet.Trigger>
      <AccountingSheet title="Дансны ангилал нэмэх">
        <AddAccountCategoryForm />
      </AccountingSheet>
    </Sheet>
  );
};

const AddAccountCategoryForm = () => {
  const form = useForm<TAccountCategoryForm>({
    resolver: zodResolver(accountCategorySchema),
    defaultValues: ACCOUNT_CATEGORY_DEFAULT_VALUES,
  });

  const { addAccountCategory, loading } = useAccountCategoryAdd();

  const handleSubmit = (data: TAccountCategoryForm) => {
    addAccountCategory({
      variables: { ...data },
      onCompleted: () => {
        form.reset();
      },
    });
  };

  return (
    <AccountCategoryForm
      form={form}
      handleSubmit={handleSubmit}
      loading={loading}
    />
  );
};
