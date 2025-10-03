import { IconPlus } from '@tabler/icons-react';
import { Button, Dialog } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { TAccountForm } from '../types/accountForm';
import { zodResolver } from '@hookform/resolvers/zod';
import { accountSchema } from '../constants/accountSchema';
import { useState } from 'react';
import { useAccountAdd } from '../hooks/useAccountAdd';
import { AccountForm } from './AccountForm';
import { AccountingDialog } from '@/layout/components/Dialog';
import { ACCOUNT_DEFAULT_VALUES } from '../constants/accountDefaultValues';

export const AddAccount = () => {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button>
          <IconPlus />
          Add Account
        </Button>
      </Dialog.Trigger>
      <AccountingDialog title="Add Account" description="Add a new account">
        <AddAccountForm setOpen={setOpen} />
      </AccountingDialog>
    </Dialog>
  );
};

const AddAccountForm = ({ setOpen }: { setOpen: (open: boolean) => void }) => {
  const form = useForm<TAccountForm>({
    resolver: zodResolver(accountSchema),
    defaultValues: ACCOUNT_DEFAULT_VALUES,
  });
  const { addAccount, loading } = useAccountAdd();

  const handleSubmit = (data: TAccountForm) => {
    addAccount({
      variables: data,
      onCompleted: () => {
        setOpen(false);
        form.reset();
      },
    });
  };

  return (
    <AccountForm form={form} handleSubmit={handleSubmit} loading={loading} />
  );
};
