import { Button, Sheet } from 'erxes-ui';
import { TVatRowForm, VatKind, VatStatus } from '../types/VatRow';
import { vatFormSchema } from '../constants/vatFormSchema';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { VatRowForm } from './VatRowForm';
import { IconPlus } from '@tabler/icons-react';
import { useAddVatRow } from '../hooks/useVatRowAdd';
import { AccountingSheet } from '~/modules/layout/components/Sheet';

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

/** add vat sheet trigger. */
export const AddVats = () => {
  return (
    <Sheet>
      <Sheet.Trigger asChild>
        <Button>
          <IconPlus />
          НӨАТ нэмэх
        </Button>
      </Sheet.Trigger>
      <AccountingSheet title="НӨАТ нэмэх">
        <AddVatForm />
      </AccountingSheet>
    </Sheet>
  );
};
