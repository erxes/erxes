import { Button, Sheet } from 'erxes-ui';
import { TCtaxRowForm, CtaxKind, CtaxStatus } from '../types/CtaxRow';
import { ctaxFormSchema } from '../constants/ctaxFormSchema';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CtaxRowForm } from './CtaxRowForm';
import { IconPlus } from '@tabler/icons-react';
import { useAddCtaxRow } from '../hooks/useCtaxRowAdd';
import { AccountingSheet } from '~/modules/layout/components/Sheet';

export const AddCtaxs = () => {
  return (
    <Sheet>
      <Sheet.Trigger asChild>
        <Button>
          <IconPlus />
          НХАТ нэмэх
        </Button>
      </Sheet.Trigger>
      <AccountingSheet title="НХАТ нэмэх">
        <AddCtaxForm />
      </AccountingSheet>
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
