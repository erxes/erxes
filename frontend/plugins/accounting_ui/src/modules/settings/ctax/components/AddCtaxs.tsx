import { Button, Sheet } from 'erxes-ui';
import { CtaxKind, CtaxStatus, TCtaxRowForm } from '../types/CtaxRow';

import { AccountingSheet } from '~/modules/layout/components/Sheet';
import { CtaxRowForm } from './CtaxRowForm';
import { IconPlus } from '@tabler/icons-react';
import { ctaxFormSchema } from '../constants/ctaxFormSchema';
import { useAddCtaxRow } from '../hooks/useCtaxRowAdd';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

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
