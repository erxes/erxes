import { Sheet, ScrollArea, Button } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { TAccountForm } from '../types/accountForm';
import { zodResolver } from '@hookform/resolvers/zod';
import { accountSchema } from '../constants/accountSchema';
import { useAccountAdd } from '../hooks/useAccountAdd';
import { AccountForm } from './AccountForm';
import { ACCOUNT_DEFAULT_VALUES } from '../constants/accountDefaultValues';
import { IconPlus } from '@tabler/icons-react';

export const AddAccount = () => {
  return (
    <Sheet>
      <Sheet.Trigger asChild>
        <Button>
          <IconPlus />
          Данс нэмэх
        </Button>
      </Sheet.Trigger>
      <Sheet.View className="p-0 flex flex-col gap-0 transition-all duration-100 ease-out overflow-hidden flex-none">
        <Sheet.Header className="flex-row gap-3 items-center p-3 space-y-0 border-b">
          <Sheet.Title>Данс нэмэх</Sheet.Title>
          <Sheet.Close />
          <Sheet.Description className="sr-only">
            Данс нэмэх
          </Sheet.Description>
        </Sheet.Header>
        <Sheet.Content className="overflow-hidden flex-auto">
          <ScrollArea className="h-full">
            <div className="p-5">
              <AddAccountForm />
            </div>
          </ScrollArea>
        </Sheet.Content>
      </Sheet.View>
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
