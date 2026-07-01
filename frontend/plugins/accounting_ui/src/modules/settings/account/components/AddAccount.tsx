import { Sheet, Button } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { TAccountForm } from '../types/accountForm';
import { zodResolver } from '@hookform/resolvers/zod';
import { accountSchema } from '../constants/accountSchema';
import { useAccountAdd } from '../hooks/useAccountAdd';
import { AccountForm } from './AccountForm';
import { ACCOUNT_DEFAULT_VALUES } from '../constants/accountDefaultValues';
import { IconPlus } from '@tabler/icons-react';
import { AccountingSheet } from '~/modules/layout/components/Sheet';

export const AddAccount = () => {
  return (
    <Sheet>
      <Sheet.Trigger asChild>
        <Button>
          <IconPlus />
          Данс нэмэх
        </Button>
      </Sheet.Trigger>
      <AccountingSheet title="Данс нэмэх">
        <AddAccountForm />
      </AccountingSheet>
    </Sheet>
  );
};

const AddAccountForm = () => {
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
      },
    });
  };

  return (
    <AccountForm form={form} handleSubmit={handleSubmit} loading={loading} />
  );
};
