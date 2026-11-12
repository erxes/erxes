import type { Activity } from '@erxes/core-contract';
import { IconHistory, IconPin } from '@tabler/icons-react';
import { Button, cn, Empty, ScrollArea, Skeleton, Spinner } from 'erxes-ui';
import { useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { type Lookups, useChangeLookups } from '~/components/ChangeList';
import { messageOf } from '~/lib/api';
import { readChanges, readNote } from './activityData';
import { ActivityItem } from './ActivityItem';
import { NoteComposer } from './NoteComposer';
import { useMinuteClock } from '~/lib/useMinuteClock';
import { dayLabel, NowContext } from './timelineTime';
import {
  NO_FILTERS,
  type TimelineFilterState,
  TimelineSearch,
  TimelineToolbar,
} from './TimelineToolbar';
import { useActivities, useActivityTypes, useNoteActions, usePinnedNotes } from './useActivities';

const PLACEHOLDER_ROWS = [1, 2, 3, 4, 5];

const TimelineSkeleton = () => (
  <div className="space-y-5 px-4 pt-4">
    {PLACEHOLDER_ROWS.map((row) => (
      <div key={row} className="flex gap-3">
        <Skeleton className="size-6 shrink-0 rounded-full" />
        <div className="flex-1 space-y-2 pt-1">
          <Skeleton className="h-3.5 w-1/2" />
          {row % 2 === 1 && <Skeleton className="h-3.5 w-4/5" />}
        </div>
      </div>
    ))}
  </div>
);

const TimelineEmpty = () => {
  const { t } = useTranslation('common', { keyPrefix: 'activity' });

  return (
    <Empty className="py-12">
      <Empty.Header>
        <Empty.Media variant="icon">
          <IconHistory />
        </Empty.Media>
        <Empty.Title>{t('empty', 'No activity yet')}</Empty.Title>
        <Empty.Description>
          {t('empty-description', 'Notes, changes, tags, links and plugin events show up here.')}
        </Empty.Description>
      </Empty.Header>
    </Empty>
  );
};

const TimelineError = ({ error, onRetry }: { error: Error; onRetry?: () => void }) => (
  <div role="alert" className="flex flex-col items-center gap-2 p-6 text-center text-sm">
    <p className="text-destructive">{messageOf(error)}</p>
    {onRetry && (
      <Button variant="outline" size="sm" onClick={onRetry}>
        Try again
      </Button>
    )}
  </div>
);

/** Entries grouped by day, newest first. */
const groupByDay = (activities: Activity[], label: (iso: string) => string) => {
  const groups: { day: string; items: Activity[] }[] = [];

  for (const activity of activities) {
    const day = label(activity.occurredAt);
    const lastGroup = groups.at(-1);

    if (lastGroup?.day === day) lastGroup.items.push(activity);
    else groups.push({ day, items: [activity] });
  }

  return groups;
};

interface TimelineTarget {
  type: string;
  id: string;
}

const PinnedNotes = ({
  pinned,
  lookups,
  pageTarget,
}: {
  pinned: Activity[];
  lookups: Lookups;
  pageTarget: TimelineTarget;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'activity' });

  return (
    <section>
      <h3 className="flex items-center gap-1.5 pb-2 text-xs font-medium text-muted-foreground">
        <IconPin className="size-3.5" />
        {t('pinned', 'Pinned')}
      </h3>
      <ol>
        {pinned.map((activity, index) => (
          <ActivityItem
            key={activity.id}
            activity={activity}
            lookups={lookups}
            last={index === pinned.length - 1}
            pageTarget={pageTarget}
            pinnedList
          />
        ))}
      </ol>
    </section>
  );
};

const TimelineEntries = ({
  timeline,
  lookups,
  pageTarget,
  now,
}: {
  timeline: ReturnType<typeof useActivities>;
  lookups: Lookups;
  pageTarget: TimelineTarget;
  now: number;
}) => {
  const { t, i18n } = useTranslation('common', { keyPrefix: 'activity' });
  const { activities, hasMore, loadingMore, loadMore } = timeline;

  if (timeline.loading) return <TimelineSkeleton />;

  if (timeline.error) return <TimelineError error={timeline.error} onRetry={timeline.retry} />;

  if (!activities.length) return <TimelineEmpty />;

  const groups = groupByDay(activities, (iso) => dayLabel(iso, now, t, i18n.language));

  return (
    <div className={cn('px-4 pt-2 transition-opacity', timeline.updating && 'opacity-60')}>
      {groups.map((group, groupIndex) => (
        <section key={group.day}>
          <h3 className="sticky top-0 z-10 flex items-center gap-3 bg-background py-2 text-xs font-medium text-muted-foreground after:h-px after:flex-1 after:bg-border">
            {group.day}
          </h3>
          <ol>
            {group.items.map((activity, index) => (
              <ActivityItem
                key={activity.id}
                activity={activity}
                lookups={lookups}
                last={
                  groupIndex === groups.length - 1 && index === group.items.length - 1 && !hasMore
                }
                pageTarget={pageTarget}
              />
            ))}
          </ol>
        </section>
      ))}
      {hasMore && (
        <div className="flex justify-center pb-4">
          <Button variant="ghost" size="sm" disabled={loadingMore} onClick={loadMore}>
            {loadingMore ? <Spinner size="sm" /> : t('load-more', 'Load more')}
          </Button>
        </div>
      )}
    </div>
  );
};

/** Names for owners, tags, fields and members the entries mention. */
const useTimelineLookups = (targetType: string, entries: Activity[]) =>
  useChangeLookups(
    targetType === 'company' ? 'company' : 'customer',
    entries.map((activity) => readChanges(activity) ?? undefined),
    entries.flatMap((activity) => [
      activity.actor.type === 'user' ? activity.actor.id : null,
      ...(readNote(activity)?.mentions ?? []),
    ]),
  );

/**
 * What happened with a customer or company, across core and plugins: a note
 * box, pinned notes, then the timeline by day, filterable; a company can show
 * its customers' entries too.
 */
export const ActivityTimeline = ({
  targetType,
  targetId,
}: {
  targetType: string;
  targetId: string;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'activity' });
  const [filters, setFilters] = useState<TimelineFilterState>(NO_FILTERS);
  const [search, setSearch] = useState<string | null>(null);
  const now = useMinuteClock();
  const q = useDeferredValue(search?.trim() ?? '');
  const catalog = useActivityTypes();
  const sources = [
    ...new Set(
      (catalog.data?.types ?? []).map((item) => item.source).filter((name) => name !== 'core'),
    ),
  ];
  const timeline = useActivities(targetType, targetId, {
    kind: filters.kind,
    includeRelated: filters.includeRelated,
    q,
    actorId: filters.actorId === 'all' ? undefined : filters.actorId,
    source: filters.source === 'all' ? undefined : filters.source,
  });
  const pinned = usePinnedNotes(targetType, targetId);
  const { add } = useNoteActions();
  const lookups = useTimelineLookups(targetType, [...(pinned.data ?? []), ...timeline.activities]);
  const pageTarget = { type: targetType, id: targetId };

  return (
    <NowContext.Provider value={now}>
      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-3 px-4 pt-4">
          <NoteComposer
            submitLabel={t('add-note', 'Add note')}
            saving={add.isPending}
            onSubmit={(draft) => add.mutateAsync({ targetType, targetId, ...draft })}
          />
          <TimelineToolbar
            filters={filters}
            onChange={setFilters}
            members={[...lookups.members.values()]}
            sources={sources}
            canIncludeRelated={targetType === 'company'}
            searching={search !== null}
            onToggleSearch={() => setSearch(search === null ? '' : null)}
          />
          {search !== null && (
            <TimelineSearch value={search} onChange={setSearch} onClose={() => setSearch(null)} />
          )}
          {catalog.isError && <TimelineError error={catalog.error} />}
          {pinned.isError && (
            <TimelineError error={pinned.error} onRetry={() => void pinned.refetch()} />
          )}
          {pinned.data && pinned.data.length > 0 && (
            <PinnedNotes pinned={pinned.data} lookups={lookups} pageTarget={pageTarget} />
          )}
        </div>
        <TimelineEntries timeline={timeline} lookups={lookups} pageTarget={pageTarget} now={now} />
      </ScrollArea>
    </NowContext.Provider>
  );
};
