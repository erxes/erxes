import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconPlus } from '@tabler/icons-react';
import { Button, Sheet } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { AccountingSheet } from '~/modules/layout/components/Sheet';
import { useJobAdd } from '../hooks/useJobMutations';
import { TJobForm } from '../types/Job';
import { getJobFormSchema } from '../types/jobFormSchema';
import { JobForm } from './JobForm';

const defaultValues: TJobForm = {
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

export const AddJobForm = ({
  setOpen,
}: {
  setOpen: (open: boolean) => void;
}) => {
  const { t } = useTranslation('accounting');
  const form = useForm<TJobForm>({
    resolver: zodResolver(getJobFormSchema(t)),
    defaultValues,
  });
  const { addJob, loading } = useJobAdd();

  const onSubmit = (data: TJobForm) => {
    addJob({
      variables: data,
      onCompleted: () => {
        form.reset(defaultValues);
        setOpen(false);
      },
    });
  };

  return <JobForm form={form} onSubmit={onSubmit} loading={loading} />;
};

export const AddJob = () => {
  const { t } = useTranslation('accounting');
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Sheet.Trigger asChild>
        <Button>
          <IconPlus />
          {t('job-add')}
        </Button>
      </Sheet.Trigger>
      <AccountingSheet title={t('job-add')} className="sm:max-w-4xl">
        <AddJobForm setOpen={setOpen} />
      </AccountingSheet>
    </Sheet>
  );
};
