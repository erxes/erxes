import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconPlus } from '@tabler/icons-react';
import { Button, Sheet } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { AccountingSheet } from '~/modules/layout/components/Sheet';
import { useTechCardAdd } from '../hooks/useTechCardMutations';
import { TTechCardForm } from '../types/TechCard';
import { getTechCardFormSchema } from '../types/techCardFormSchema';
import { TechCardForm } from './TechCardForm';

const defaultValues: TTechCardForm = {
  code: '',
  name: '',
  description: '',
  duration: undefined,
  durationType: 'minut',
  laborCosts: [],
  overheadCosts: [],
  status: 'active',
  inputs: [{ productId: '', uom: '', quantity: 1 }],
  outputs: [{ productId: '', uom: '', quantity: 1, costRatio: 1 }],
};

export const AddTechCardForm = ({
  setOpen,
}: {
  setOpen: (open: boolean) => void;
}) => {
  const { t } = useTranslation('accounting');
  const form = useForm<TTechCardForm>({
    resolver: zodResolver(getTechCardFormSchema(t)),
    defaultValues,
  });
  const { addTechCard, loading } = useTechCardAdd();

  const onSubmit = (data: TTechCardForm) => {
    addTechCard({
      variables: data,
      onCompleted: () => {
        form.reset(defaultValues);
        setOpen(false);
      },
    });
  };

  return <TechCardForm form={form} onSubmit={onSubmit} loading={loading} />;
};

export const AddTechCard = () => {
  const { t } = useTranslation('accounting');
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Sheet.Trigger asChild>
        <Button>
          <IconPlus />
          {t('tech-card-add')}
        </Button>
      </Sheet.Trigger>
      <AccountingSheet title={t('tech-card-add')} className="sm:max-w-4xl">
        <AddTechCardForm setOpen={setOpen} />
      </AccountingSheet>
    </Sheet>
  );
};
