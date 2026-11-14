import { IconActivity } from '@tabler/icons-react';
import { Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { ACTIVITY_DAYS, useMemberActivity } from '../hooks/useMemberActivity';
import { formatActiveMinutes } from '../utils/formatActiveMinutes';
import { ActivityDailyChart } from './ActivityDailyChart';
import { ActivityHeatmap } from './ActivityHeatmap';
import { ActivityRecentDays } from './ActivityRecentDays';

const EmptyState = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => (
  <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
    <IconActivity className="size-6 text-muted-foreground" />
    <p className="text-sm font-medium">{title}</p>
    <p className="text-xs text-muted-foreground">{description}</p>
  </div>
);

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <section className="flex flex-col gap-2">
    <h4 className="text-xs font-medium text-muted-foreground">{title}</h4>
    {children}
  </section>
);

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col gap-0.5 rounded-lg border px-3 py-2">
    <span className="text-xs text-muted-foreground">{label}</span>
    <span className="text-base font-semibold tabular-nums">{value}</span>
  </div>
);

export const MemberActivityTime = ({ userId }: { userId: string }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });
  const { enabled, breakdown, loading, error } = useMemberActivity(userId);

  if (loading) {
    return <Spinner containerClassName="py-12" />;
  }

  if (error) {
    return (
      <EmptyState
        title={t('activity-load-failed')}
        description={error.message}
      />
    );
  }

  if (!enabled || !breakdown) {
    return (
      <EmptyState
        title={t('activity-tracking-off')}
        description={t('activity-tracking-off-description')}
      />
    );
  }

  if (!breakdown.totalMinutes) {
    return (
      <EmptyState
        title={t('no-activity-yet')}
        description={t('no-activity-description', { count: ACTIVITY_DAYS })}
      />
    );
  }

  const { days, heatmap, totalMinutes, activeDays } = breakdown;

  return (
    <div className="flex flex-col gap-5 p-3">
      <div className="grid grid-cols-3 gap-2">
        <Stat
          label={t('active-last-days', { count: ACTIVITY_DAYS })}
          value={formatActiveMinutes(t, totalMinutes)}
        />
        <Stat label={t('active-days')} value={String(activeDays)} />
        <Stat
          label={t('average-per-active-day')}
          value={formatActiveMinutes(t, Math.round(totalMinutes / activeDays))}
        />
      </div>
      <Section title={t('active-hours-per-day')}>
        <ActivityDailyChart days={days} />
      </Section>
      <Section title={t('weekly-pattern')}>
        <ActivityHeatmap heatmap={heatmap} />
      </Section>
      <Section title={t('recent-days')}>
        <ActivityRecentDays days={days} />
      </Section>
      <p className="text-xs text-muted-foreground">
        {t('activity-measure-note')}
      </p>
    </div>
  );
};
