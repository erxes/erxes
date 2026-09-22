import { Button, Sheet } from 'erxes-ui';

import { ACCOUNT_CATEGORY_DEFAULT_VALUES } from '../constants/accountCategoryDefaultValues';
import { AccountCategoryForm } from './AccountCategoryForm';
import { AccountingSheet } from '~/modules/layout/components/Sheet';
import { IconPlus } from '@tabler/icons-react';
import { TAccountCategoryForm } from '../types/AccountCategory';
import { accountCategorySchema } from '../constants/accountCategorySchema';
import { useAccountCategoryAdd } from '../hooks/useAccountCategoryAdd';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

const AddAccountCategoryForm = ({
  setOpen,
}: {
  setOpen: (open: boolean) => void;
}) => {
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
        setOpen(false);
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

export const AddAccountCategory = () => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Sheet.Trigger asChild>
        <Button>
          <IconPlus />
          Дансны ангилал нэмэх
        </Button>
      </Sheet.Trigger>
      <AccountingSheet title="Дансны ангилал нэмэх">
        <AddAccountCategoryForm setOpen={setOpen} />
      </AccountingSheet>
    </Sheet>
  );
};
