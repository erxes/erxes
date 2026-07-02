import { Button, Sheet } from 'erxes-ui';
import { TCtaxRowForm, CtaxKind, CtaxStatus } from '../types/CtaxRow';
import { ctaxFormSchema } from '../constants/ctaxFormSchema';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CtaxRowForm } from './CtaxRowForm';
import { IconPlus } from '@tabler/icons-react';
import { useAddCtaxRow } from '../hooks/useCtaxRowAdd';
import { AccountingSheet } from '~/modules/layout/components/Sheet';
import { useState } from 'react';

/** ene ctax add form setup. */
export const AddCtaxForm = ({
  setOpen,
}: {
  setOpen: (open: boolean) => void;
}) => {
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
        setOpen(false);
      },
    });
  };

  return <CtaxRowForm form={form} onSubmit={onSubmit} loading={loading} />;
};

/** ene ctax add sheet. */
export const AddCtaxs = () => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Sheet.Trigger asChild>
        <Button>
          <IconPlus />
          НХАТ нэмэх
        </Button>
      </Sheet.Trigger>
      <AccountingSheet title="НХАТ нэмэх">
        <AddCtaxForm setOpen={setOpen} />
      </AccountingSheet>
    </Sheet>
  );
};
