import { IconActivity } from '@tabler/icons-react';
import { Button, Spinner, ToggleGroup } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  RANKING_PERIODS,
  TRankingPeriod,
  useTeamActivityRanking,
} from '../hooks/useTeamActivityRanking';
import { formatActiveMinutes } from '../utils/formatActiveMinutes';
import { ActivityRankRow } from './ActivityRankRow';
import { TeamActivityChart } from './TeamActivityChart';

const EmptyState = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => (
  <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
    <IconActivity className="size-6 text-muted-foreground" />
    <p className="text-sm font-medium">{title}</p>
    <p className="text-xs text-muted-foreground">{description}</p>
  </div>
);

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col gap-0.5 rounded-lg border bg-background px-3 py-2">
    <span className="text-xs text-muted-foreground">{label}</span>
    <span className="text-base font-semibold tabular-nums">{value}</span>
  </div>
);

export const TeamActivityOverview = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });
  const [days, setDays] = useState<TRankingPeriod>(7);
  const {
    enabled,
    series,
    memberCount,
    active,
    inactive,
    totalMinutes,
    loading,
    error,
  } = useTeamActivityRanking(days);

  const renderBody = () => {
    if (loading) {
      return <Spinner containerClassName="py-16" />;
    }

    if (error) {
      return (
        <EmptyState
          title={t('activity-load-failed')}
          description={error.message}
        />
      );
    }

    if (!enabled) {
      return (
        <EmptyState
          title={t('activity-tracking-off')}
          description={t('activity-tracking-off-description')}
        />
      );
    }

    const maxMinutes = active[0]?.activeMinutes ?? 0;

    return (
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-3 gap-2">
          <Stat
            label={t('active-members')}
            value={`${active.length} / ${memberCount}`}
          />
          <Stat
            label={t('team-active-total')}
            value={formatActiveMinutes(t, totalMinutes)}
          />
          <Stat
            label={t('average-per-active-member')}
            value={formatActiveMinutes(
              t,
              active.length ? Math.round(totalMinutes / active.length) : 0,
            )}
          />
        </div>
        <TeamActivityChart series={series} />
        <section className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold">{t('most-active')}</h3>
          {active.length ? (
            <ul className="flex flex-col divide-y rounded-lg border bg-background">
              {active.map((item, index) => (
                <ActivityRankRow
                  key={item.user._id}
                  item={item}
                  rank={index + 1}
                  maxMinutes={maxMinutes}
                />
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              {t('no-active-members', { count: days })}
            </p>
          )}
        </section>
        <section className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold">
            {t('inactive-members', { count: days })}
          </h3>
          {inactive.length ? (
            <ul className="flex flex-col divide-y rounded-lg border bg-background">
              {inactive.map((item) => (
                <ActivityRankRow key={item.user._id} item={item} />
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              {t('everyone-active')}
            </p>
          )}
        </section>
        <p className="text-xs text-muted-foreground">
          {t('activity-measure-note')}
        </p>
      </div>
    );
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">{t('team-activity')}</h2>
        <ToggleGroup
          type="single"
          value={String(days)}
          onValueChange={(value) =>
            value && setDays(Number(value) as TRankingPeriod)
          }
        >
          {RANKING_PERIODS.map((period) => (
            <ToggleGroup.Item key={period} value={String(period)} asChild>
              <Button variant="ghost" size="sm">
                {t('active-last-days', { count: period })}
              </Button>
            </ToggleGroup.Item>
          ))}
        </ToggleGroup>
      </div>
      {renderBody()}
    </div>
  );
};
