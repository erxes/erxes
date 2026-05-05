import { Button, Sheet, ScrollArea } from 'erxes-ui';
import { TCtaxRowForm, CtaxKind, CtaxStatus } from '../types/CtaxRow';
import { ctaxFormSchema } from '../constants/ctaxFormSchema';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CtaxRowForm } from './CtaxRowForm';
import { IconPlus } from '@tabler/icons-react';
import { useAddCtaxRow } from '../hooks/useCtaxRowAdd';

export const AddCtaxs = () => {
  return (
    <Sheet>
      <Sheet.Trigger asChild>
        <Button>
          <IconPlus />
          НХАТ нэмэх
        </Button>
      </Sheet.Trigger>
      <Sheet.View className="p-0 flex flex-col gap-0 transition-all duration-100 ease-out overflow-hidden flex-none">
        <Sheet.Header className="flex-row gap-3 items-center p-3 space-y-0 border-b">
          <Sheet.Title>НХАТ нэмэх</Sheet.Title>
          <Sheet.Close />
          <Sheet.Description className="sr-only">
            НХАТ нэмэх
          </Sheet.Description>
        </Sheet.Header>
        <Sheet.Content className="overflow-hidden flex-auto">
          <ScrollArea className="h-full">
            <div className="p-5">
              <AddCtaxForm />
            </div>
          </ScrollArea>
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
};

export const AddCtaxForm = () => {
  const form = useForm<TCtaxRowForm>({
    resolver: zodResolver(ctaxFormSchema),
    defaultValues: {
      status: CtaxStatus.ACTIVE,
      kind: CtaxKind.NORMAL,
    },
  });
  const { addCtax, loading } = useAddCtaxRow();

  const onSubmit = (data: TCtaxRowForm) => {
    addCtax({
      variables: { ...data },
      onCompleted: () => {
        form.reset();
      },
    });
  };

  return <CtaxRowForm form={form} onSubmit={onSubmit} loading={loading} />;
};
