import { Button, Dialog } from 'erxes-ui';
import { useState } from 'react';
import { TCtaxRowForm, CtaxKind, CtaxStatus } from '../types/CtaxRow';
import { ctaxFormSchema } from '../constants/ctaxFormSchema';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CtaxRowForm } from './CtaxRowForm';
import { IconPlus } from '@tabler/icons-react';
import { useAddCtaxRow } from '../hooks/useCtaxRowAdd';

export const AddCtaxs = () => {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button>
          <IconPlus />
          Add Ctax
        </Button>
      </Dialog.Trigger>
      <Dialog.ContentCombined
        title="Add Ctax"
        description="Add a new ctax"
        className="sm:max-w-2xl"
      >
        <AddCtaxForm setOpen={setOpen} />
      </Dialog.ContentCombined>
    </Dialog>
  );
};

export const AddCtaxForm = ({ setOpen }: { setOpen: (open: boolean) => void }) => {
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
        setOpen(false);
        form.reset();
      },
    });
  };

  return <CtaxRowForm form={form} onSubmit={onSubmit} loading={loading} />;
};
