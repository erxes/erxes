import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Spinner, isDeeplyEqual } from 'erxes-ui';
import { useSidePanel } from 'ui-modules';
import { SettingsPanelRemoveAction } from '@/settings/components/panel/SettingsPanelActions';
import {
  ISettingsPanelViewProps,
  ISettingsPanelViews,
} from '@/settings/components/panel/SettingsPanelLayout';
import { JOB_CONTENT_TYPE } from '@/settings/constants/settingsPanel';
import { useSettingsPanel } from '@/settings/hooks/useSettingsPanel';
import { JobForm } from '@/settings/jobs/components/JobForm';
import { useJobDetail } from '@/settings/jobs/hooks/useJobDetail';
import {
  useJobAdd,
  useJobEdit,
  useJobRemove,
} from '@/settings/jobs/hooks/useJobMutations';
import { IJob, TJobForm } from '@/settings/jobs/types/Job';
import { getJobFormSchema } from '@/settings/jobs/types/jobFormSchema';
import { jobFormValues } from '@/settings/jobs/utils/jobFormValues';

const JOB_DEFAULT_VALUES: TJobForm = {
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

const JobPanelNew = () => {
  const { t } = useTranslation('accounting');
  const { openDetail, cancelDraft } = useSettingsPanel(JOB_CONTENT_TYPE);
  const { addJob, loading } = useJobAdd();
  const form = useForm<TJobForm>({
    resolver: zodResolver(getJobFormSchema(t)),
    defaultValues: JOB_DEFAULT_VALUES,
  });

  const handleSubmit = (data: TJobForm) => {
    if (loading) {
      return;
    }

    addJob({
      variables: data,
      onCompleted: ({ jobAdd }) => {
        if (jobAdd?._id) {
          openDetail(jobAdd._id, { replace: true });
        }
      },
    });
  };

  return (
    <JobForm
      form={form}
      onSubmit={handleSubmit}
      onCancel={cancelDraft}
      loading={loading}
    />
  );
};

const JobPanelActions = ({ contentId }: ISettingsPanelViewProps) => {
  const { t } = useTranslation('accounting');
  const { removeJob, loading } = useJobRemove();

  return (
    <SettingsPanelRemoveAction
      message={t('job-confirm-delete')}
      loading={loading}
      onRemove={(onCompleted) =>
        removeJob({ variables: { _id: contentId }, onCompleted })
      }
    />
  );
};

const JobEditForm = ({ job }: { job: IJob }) => {
  const { t } = useTranslation('accounting');
  const { close } = useSidePanel();
  const { editJob, loading } = useJobEdit();
  const form = useForm<TJobForm>({
    resolver: zodResolver(getJobFormSchema(t)),
    defaultValues: jobFormValues(job),
  });
  const { reset } = form;

  useEffect(() => {
    reset(jobFormValues(job));
  }, [reset, job]);

  const handleSubmit = (data: TJobForm) => {
    if (loading) {
      return;
    }

    if (isDeeplyEqual(data, jobFormValues(job))) {
      close();
      return;
    }

    editJob({ variables: { _id: job._id, ...data } });
  };

  return (
    <JobForm
      form={form}
      onSubmit={handleSubmit}
      onCancel={close}
      loading={loading}
    />
  );
};

const JobPanelDetail = ({ contentId }: ISettingsPanelViewProps) => {
  const { jobDetail, loading } = useJobDetail(contentId);

  if (!jobDetail) {
    return loading ? <Spinner containerClassName="py-12" /> : null;
  }

  return <JobEditForm key={jobDetail._id} job={jobDetail} />;
};

export const JOB_PANEL: ISettingsPanelViews = {
  addLabel: 'job-add',
  editLabel: 'job-edit',
  New: JobPanelNew,
  Actions: JobPanelActions,
  Detail: JobPanelDetail,
};
