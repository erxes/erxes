import { Button, Dialog } from 'erxes-ui';
import { IconPlus } from '@tabler/icons-react';
import { useState } from 'react';
import { AccountingDialog } from '@/layout/components/Dialog';
import { zodResolver } from '@hookform/resolvers/zod';
import { TAccountCategoryForm } from '../types/AccountCategory';
import { useForm } from 'react-hook-form';
import { accountCategorySchema } from '../constants/accountCategorySchema';
import { ACCOUNT_CATEGORY_DEFAULT_VALUES } from '../constants/accountCategoryDefaultValues';
import { AccountCategoryForm } from './AccountCategoryForm';
import { useAccountCategoryAdd } from '../hooks/useAccountCategoryAdd';

export const AddAccountCategory = () => {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button>
          <IconPlus />
          Add account category
        </Button>
      </Dialog.Trigger>
      <AccountingDialog
        title="Add account category"
        description="Add a new account category"
      >
        <AddAccountCategoryForm setOpen={setOpen} />
      </AccountingDialog>
    </Dialog>
  );
};

const AddAccountCategoryForm = ({ setOpen }: { setOpen: (open: boolean) => void }) => {
  const form = useForm<TAccountCategoryForm>({
    resolver: zodResolver(accountCategorySchema),
    defaultValues: ACCOUNT_CATEGORY_DEFAULT_VALUES,
  });

  const { addAccountCategory, loading } = useAccountCategoryAdd();

  const handleSubmit = (data: TAccountCategoryForm) => {
    addAccountCategory({
      variables: { ...data },
      onCompleted: () => {
        setOpen(false);
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
