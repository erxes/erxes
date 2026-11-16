import type { Activity } from '@erxes/core-contract';
import { ScrollArea } from 'erxes-ui';
import { useDeferredValue, useState } from 'react';
import { type Lookups, useChangeLookups } from '~/components/ChangeList';
import { readChanges } from '~/modules/activity/activityData';
import {
  TimelineEntries,
  TimelineError,
  useTimelineSources,
} from '~/modules/activity/ActivityTimeline';
import { NowContext } from '~/modules/activity/timelineTime';
import {
  NO_FILTERS,
  type TimelineFilterState,
  TimelineSearch,
  TimelineToolbar,
} from '~/modules/activity/TimelineToolbar';
import { useMemberActivities } from '~/modules/activity/useActivities';
import { useMinuteClock } from '~/lib/useMinuteClock';

const changesOn = (entries: Activity[], targetType: 'customer' | 'company') =>
  entries
    .filter((entry) => entry.targetType === targetType)
    .map((entry) => readChanges(entry) ?? undefined);

/** Names for what the entries mention, on customers and companies alike. */
const useFeedLookups = (entries: Activity[]): Lookups => {
  const customers = useChangeLookups(
    'customer',
    changesOn(entries, 'customer'),
    entries.flatMap((entry) => [
      entry.actorType === 'user' ? entry.actorId : null,
      ...(entry.note?.mentions ?? []),
    ]),
  );

  const companies = useChangeLookups('company', changesOn(entries, 'company'));

  return {
    members: new Map([...companies.members, ...customers.members]),
    tags: new Map([...customers.tags, ...companies.tags]),
    fields: new Map([...customers.fields, ...companies.fields]),
  };
};

/**
 * What a member did: their notes, changes and plugin events on every record you may see,
 * by day, each saying which record it was on.
 */
export const MemberActivity = ({ memberId }: { memberId: string }) => {
  const [filters, setFilters] = useState<TimelineFilterState>(NO_FILTERS);
  const [search, setSearch] = useState<string | null>(null);
  const now = useMinuteClock();
  const q = useDeferredValue(search?.trim() ?? '');
  const { catalog, sources } = useTimelineSources();

  const timeline = useMemberActivities(memberId, {
    kind: filters.kind,
    q,
    source: filters.source === 'all' ? undefined : filters.source,
  });

  const lookups = useFeedLookups(timeline.activities);

  return (
    <NowContext.Provider value={now}>
      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-3 px-4 pt-4">
          <TimelineToolbar
            filters={filters}
            onChange={setFilters}
            sources={sources}
            canIncludeRelated={false}
            searching={search !== null}
            onToggleSearch={() => setSearch(search === null ? '' : null)}
          />
          {search !== null && (
            <TimelineSearch value={search} onChange={setSearch} onClose={() => setSearch(null)} />
          )}
          {catalog.isError && <TimelineError error={catalog.error} />}
        </div>
        {/* No entry is on the member: each says the record it was on. */}
        <TimelineEntries
          timeline={timeline}
          lookups={lookups}
          pageTarget={{ type: 'user', id: memberId }}
          now={now}
        />
      </ScrollArea>
    </NowContext.Provider>
  );
};
