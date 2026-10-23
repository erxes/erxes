import { useTranslation } from 'react-i18next';
import { RecordTableInlineCell } from 'erxes-ui';
import { IJob } from '@/settings/jobs/types/Job';

export const JobDuration = ({
  duration,
  durationType,
}: Pick<IJob, 'duration' | 'durationType'>) => {
  const { t } = useTranslation('accounting');
  const unitLabel = durationType ? t('job-duration-' + durationType) : '';
  const label =
    durationType === 'real'
      ? t('job-duration-real')
      : `${duration ?? '-'} ${unitLabel}`;
  return <RecordTableInlineCell>{label}</RecordTableInlineCell>;
};
