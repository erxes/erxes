import { Button, Sheet, ScrollArea } from 'erxes-ui';
import { IconPlus } from '@tabler/icons-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { TAccountCategoryForm } from '../types/AccountCategory';
import { useForm } from 'react-hook-form';
import { accountCategorySchema } from '../constants/accountCategorySchema';
import { ACCOUNT_CATEGORY_DEFAULT_VALUES } from '../constants/accountCategoryDefaultValues';
import { AccountCategoryForm } from './AccountCategoryForm';
import { useAccountCategoryAdd } from '../hooks/useAccountCategoryAdd';

export const AddAccountCategory = () => {
  return (
    <Sheet>
      <Sheet.Trigger asChild>
        <Button>
          <IconPlus />
          Дансны ангилал нэмэх
        </Button>
      </Sheet.Trigger>
      <Sheet.View className="p-0 flex flex-col gap-0 transition-all duration-100 ease-out overflow-hidden flex-none">
        <Sheet.Header className="flex-row gap-3 items-center p-3 space-y-0 border-b">
          <Sheet.Title>Дансны ангилал нэмэх</Sheet.Title>
          <Sheet.Close />
          <Sheet.Description className="sr-only">
            Дансны ангилал нэмэх
          </Sheet.Description>
        </Sheet.Header>
        <Sheet.Content className="overflow-hidden flex-auto">
          <ScrollArea className="h-full">
            <div className="p-5">
              <AddAccountCategoryForm />
            </div>
          </ScrollArea>
        </Sheet.Content>
      </Sheet.View>
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
