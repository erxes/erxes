import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { Sheet, Spinner, isDeeplyEqual, useQueryState } from 'erxes-ui';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { AccountingSheet } from '~/modules/layout/components/Sheet';
import { useJobDetail } from '../hooks/useJobDetail';
import { useJobEdit } from '../hooks/useJobMutations';
import { TJobForm } from '../types/Job';
import { getJobFormSchema } from '@/settings/jobs/types/jobFormSchema';
import { jobFormValues } from '@/settings/jobs/utils/jobFormValues';
import { JobForm } from './JobForm';

export const EditJobForm = () => {
  const { t } = useTranslation('accounting');
  const { jobDetail, closeDetail, loading } = useJobDetail();
  const { editJob, loading: editLoading } = useJobEdit();
  const form = useForm<TJobForm>({
    resolver: zodResolver(getJobFormSchema(t)),
    defaultValues: {
      inputs: [],
      outputs: [],
      laborCosts: [],
      overheadCosts: [],
    },
  });
  const { reset } = form;

  useEffect(() => {
    if (jobDetail) {
      reset(jobFormValues(jobDetail));
    }
  }, [reset, jobDetail]);

  const handleSubmit = (data: TJobForm) => {
    if (!jobDetail) {
      return;
    }

    const initialData = jobFormValues(jobDetail);

    if (isDeeplyEqual(data, initialData)) {
      reset();
      closeDetail();
      return;
    }

    editJob({
      variables: {
        _id: jobDetail._id,
        ...data,
      },
      onCompleted: () => {
        closeDetail();
        reset();
      },
    });
  };

  return (
    <>
      <JobForm form={form} onSubmit={handleSubmit} loading={editLoading} />
      {loading && (
        <div className="absolute inset-0 bg-background/10 backdrop-blur-xs flex items-center justify-center rounded-md">
          <Spinner />
        </div>
      )}
    </>
  );
};

export const EditJob = () => {
  const { t } = useTranslation('accounting');
  const [open, setOpen] = useQueryState<string>('job_id');

  return (
    <Sheet
      open={open !== null}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          setOpen(null);
        }
      }}
    >
      <AccountingSheet title={t('job-edit')} className="sm:max-w-4xl">
        <EditJobForm />
      </AccountingSheet>
    </Sheet>
  );
};
