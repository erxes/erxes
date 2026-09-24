import { useBroadcastSchedulePreview } from '../../hooks/useBroadcastSchedulePreview';
import {
  describeRecurrence,
  isRecurringForm,
  scheduleToForm,
} from '../../utils/scheduleForm';
import { useTranslation } from 'react-i18next';
import { TBroadcastMessage } from '../../types';

const when = (value?: string | Date | null) =>
  value
    ? new Date(value).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : null;

const Fact = ({ label, value }: { label: string; value: string }) => (
  <span className="text-muted-foreground inline-flex gap-2">
    {label}
    <strong className="text-primary">{value}</strong>
  </span>
);

/**
 * What the schedule is going to do next.
 *
 * A repeating campaign is the one thing in this list nobody can read from the
 * run counts alone: "has run 1" says nothing about whether four more are
 * coming or it is finished. The remaining count is asked of the scheduler, so
 * it is the same arithmetic that sets the alarms.
 */
export const BroadcastScheduleSummary = ({
  message,
}: {
  message: TBroadcastMessage;
}) => {
  const { t, i18n } = useTranslation('broadcasts');
  const schedule = scheduleToForm(message?.scheduleDate);
  const { count } = useBroadcastSchedulePreview(schedule);

  const nextRun = when(message?.nextRunAt);

  if (!schedule) {
    return null;
  }

  if (!isRecurringForm(schedule)) {
    return nextRun ? (
      <div className="space-x-8">
        <Fact label={t('schedule.goes-out')} value={nextRun} />
      </div>
    ) : null;
  }

  const ran = message?.runCount || 0;

  return (
    <div className="space-x-8">
      <Fact
        label={t('schedule.repeats')}
        value={describeRecurrence(schedule, t, i18n.language)}
      />
      {!!nextRun && <Fact label={t('schedule.next-run')} value={nextRun} />}
      {count !== undefined && (
        <Fact
          label={t('schedule.runs')}
          value={t('schedule.runs-of', { ran, total: ran + count })}
        />
      )}
      {!nextRun && (
        <Fact label={t('schedule.status')} value={t('schedule.finished')} />
      )}
    </div>
  );
};
