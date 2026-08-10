import { Button, Sheet } from 'erxes-ui';

import { ACCOUNT_DEFAULT_VALUES } from '../constants/accountDefaultValues';
import { AccountForm } from './AccountForm';
import { AccountingSheet } from '~/modules/layout/components/Sheet';
import { IconPlus } from '@tabler/icons-react';
import { TAccountForm } from '../types/accountForm';
import { accountSchema } from '../constants/accountSchema';
import { useAccountAdd } from '../hooks/useAccountAdd';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

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
        form.reset();
        setOpen(false);
      },
    });
  };

  return (
    <AccountForm form={form} handleSubmit={handleSubmit} loading={loading} />
  );
};

export const AddAccount = () => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Sheet.Trigger asChild>
        <Button>
          <IconPlus />
          Данс нэмэх
        </Button>
      </Sheet.Trigger>
      <AccountingSheet title="Данс нэмэх">
        <AddAccountForm setOpen={setOpen} />
      </AccountingSheet>
    </Sheet>
  );
};
