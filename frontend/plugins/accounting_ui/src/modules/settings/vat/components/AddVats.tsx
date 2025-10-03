import { Button, Dialog } from 'erxes-ui';
import { useState } from 'react';
import { TVatRowForm, VatKind, VatStatus } from '../types/VatRow';
import { vatFormSchema } from '../constants/vatFormSchema';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { VatRowForm } from './VatRowForm';
import { IconPlus } from '@tabler/icons-react';
import { useAddVatRow } from '../hooks/useVatRowAdd';

export const AddVats = () => {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button>
          <IconPlus />
          Add Vat
        </Button>
      </Dialog.Trigger>
      <Dialog.ContentCombined
        title="Add Vat"
        description="Add a new vat"
        className="sm:max-w-2xl"
      >
        <AddVatForm setOpen={setOpen} />
      </Dialog.ContentCombined>
    </Dialog>
  );
};

export const AddVatForm = ({ setOpen }: { setOpen: (open: boolean) => void }) => {
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
        setOpen(false);
        form.reset();
      },
    });
  };

  return <VatRowForm form={form} onSubmit={onSubmit} loading={loading} />;
};
