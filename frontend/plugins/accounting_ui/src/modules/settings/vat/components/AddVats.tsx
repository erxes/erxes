import { Button, Sheet, ScrollArea } from 'erxes-ui';
import { TVatRowForm, VatKind, VatStatus } from '../types/VatRow';
import { vatFormSchema } from '../constants/vatFormSchema';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { VatRowForm } from './VatRowForm';
import { IconPlus } from '@tabler/icons-react';
import { useAddVatRow } from '../hooks/useVatRowAdd';

export const AddVats = () => {
  return (
    <Sheet>
      <Sheet.Trigger asChild>
        <Button>
          <IconPlus />
          НӨАТ нэмэх
        </Button>
      </Sheet.Trigger>
      <Sheet.View className="p-0 flex flex-col gap-0 transition-all duration-100 ease-out overflow-hidden flex-none">
        <Sheet.Header className="flex-row gap-3 items-center p-3 space-y-0 border-b">
          <Sheet.Title>НӨАТ нэмэх</Sheet.Title>
          <Sheet.Close />
          <Sheet.Description className="sr-only">
            НӨАТ нэмэх
          </Sheet.Description>
        </Sheet.Header>
        <Sheet.Content className="overflow-hidden flex-auto">
          <ScrollArea className="h-full">
            <div className="p-5">
              <AddVatForm />
            </div>
          </ScrollArea>
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
};

export const AddVatForm = () => {
  const form = useForm<TVatRowForm>({
    resolver: zodResolver(vatFormSchema),
    defaultValues: {
      status: VatStatus.ACTIVE,
      isBold: false,
      kind: VatKind.NORMAL,
    },
  });
  const { addVat, loading } = useAddVatRow();

  const onSubmit = (data: TVatRowForm) => {
    addVat({
      variables: { ...data },
      onCompleted: () => {
        form.reset();
      },
    });
  };

  return <VatRowForm form={form} onSubmit={onSubmit} loading={loading} />;
};
