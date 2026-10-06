import { useTranslation } from 'react-i18next';
import { Button, Sheet } from 'erxes-ui';
import { TVatRowForm, VatKind, VatStatus } from '../types/VatRow';

import { AccountingSheet } from '~/modules/layout/components/Sheet';
import { IconPlus } from '@tabler/icons-react';
import { VatRowForm } from './VatRowForm';
import { useAddVatRow } from '../hooks/useVatRowAdd';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { vatFormSchema } from '../constants/vatFormSchema';
import { zodResolver } from '@hookform/resolvers/zod';

export const AddVatForm = ({
  setOpen,
}: {
  setOpen: (open: boolean) => void;
}) => {
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
        setOpen(false);
      },
    });
  };

  return <VatRowForm form={form} onSubmit={onSubmit} loading={loading} />;
};

export const AddVats = () => {
  const { t } = useTranslation('accounting');

  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Sheet.Trigger asChild>
        <Button>
          <IconPlus />
          {t('add-vat-rule')}
        </Button>
      </Sheet.Trigger>
      <AccountingSheet title={t('add-vat-rule')}>
        <AddVatForm setOpen={setOpen} />
      </AccountingSheet>
    </Sheet>
  );
};
