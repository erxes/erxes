import type { Activity } from '@erxes/core-contract';
import {
  IconArrowsJoin,
  IconBeach,
  IconBriefcase,
  IconCalendarEvent,
  IconCash,
  IconChecklist,
  IconCreditCard,
  IconFileText,
  IconGift,
  IconHeartHandshake,
  IconHistory,
  IconLink,
  IconLinkOff,
  IconMail,
  IconMessage,
  IconPackage,
  IconPencil,
  IconPhoneCall,
  IconPlug,
  IconPlus,
  IconProgress,
  IconReceipt,
  IconShoppingCart,
  IconStar,
  IconTag,
  IconTicket,
  IconTruck,
  IconUserCheck,
  IconUsers,
  type Icon,
} from '@tabler/icons-react';
import { Badge, cn, Skeleton } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ChangeList, type Lookups } from '~/components/ChangeList';
import { actorLabel, pluginLabel } from '~/lib/members';
import type { ReactNode } from 'react';
import { isNoteType, readChanges, readNote, verbOf } from './activityData';
import { LinkedRecord, Sentence } from './ActivitySentence';
import { NoteItem } from './NoteEntry';
import { When } from './timelineTime';
import { Reactions } from './TimelineExtras';
import { useActivityTypes } from './useActivities';

const ICONS: Record<string, Icon> = {
  created: IconPlus,
  updated: IconPencil,
  tagged: IconTag,
  merged: IconArrowsJoin,
  company_linked: IconLink,
  customer_linked: IconLink,
  company_unlinked: IconLinkOff,
  customer_unlinked: IconLinkOff,
  lead: IconProgress,
};

/**
 * Icons plugins may name for their entry types (`activityTypes[].icon` in the
 * manifest). A fixed set: importing every icon by name would bloat the app.
 */
const PLUGIN_ICONS: Record<string, Icon> = {
  IconBeach,
  IconBriefcase,
  IconCalendarEvent,
  IconCash,
  IconChecklist,
  IconCreditCard,
  IconFileText,
  IconGift,
  IconHeartHandshake,
  IconMail,
  IconMessage,
  IconPackage,
  IconPhoneCall,
  IconReceipt,
  IconShoppingCart,
  IconStar,
  IconTicket,
  IconTruck,
  IconUserCheck,
  IconUsers,
};

/** Until the team is known, a placeholder rather than "A team member". */
const isNamed = (activity: Activity, lookups: Lookups) =>
  activity.actor.type !== 'user' ||
  !activity.actor.id ||
  Boolean(activity.actor.name) ||
  lookups.members.size > 0;

/** Plugin entries: who, and the plugin's label for the type. */
const PluginMeta = ({
  activity,
  actor,
  label,
}: {
  activity: Activity;
  actor: string;
  label?: string;
}) => (
  <>
    {activity.actor.type === 'user' && <span>{actor}</span>}
    <Badge variant="secondary" size="sm">
      {pluginLabel(activity.source)}
      {label ? ` · ${label}` : ''}
    </Badge>
  </>
);

/** Everything but notes: one line (marker, sentence, time), and details below when there are any. */
const EventItem = ({
  activity,
  lookups,
  actor,
  onRelated,
  rail,
}: {
  activity: Activity;
  lookups: Lookups;
  actor: string;
  onRelated: ReactNode;
  rail: ReactNode;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'activity' });
  const catalog = useActivityTypes();
  const plugin = activity.source !== 'core';
  const look = plugin ? catalog.data?.types.find((item) => item.type === activity.type) : undefined;

  const ItemIcon = plugin
    ? (look?.icon && PLUGIN_ICONS[look.icon]) || IconPlug
    : (ICONS[verbOf(activity)] ?? IconHistory);

  const changes = plugin ? null : readChanges(activity);

  return (
    <li className="relative flex gap-3 pb-4">
      {rail}
      <span
        className={cn(
          'relative z-1 flex size-6 shrink-0 items-center justify-center rounded-full border bg-background ring-4 ring-background',
          look?.color ? 'text-(--activity-color)' : 'text-muted-foreground',
        )}
        style={{ '--activity-color': look?.color ?? undefined }}
      >
        <ItemIcon className="size-3" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm leading-6 text-muted-foreground [&_.font-medium]:text-foreground">
          {isNamed(activity, lookups) ? (
            <Sentence activity={activity} actor={actor} lookups={lookups} />
          ) : (
            <Skeleton className="mt-1 inline-block h-3.5 w-48" />
          )}
          {onRelated}
          <When iso={activity.occurredAt} className="ml-2" />
        </p>
        {changes && <ChangeList changes={changes} lookups={lookups} className="mt-1.5" />}
        {(plugin || activity.link) && (
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            {plugin && <PluginMeta activity={activity} actor={actor} label={look?.label} />}
            {activity.link && (
              <Link to={activity.link} className="text-primary-text hover:underline">
                {t('open', 'Open')}
              </Link>
            )}
          </div>
        )}
        {Object.keys(activity.reactions).length > 0 && (
          <div className="mt-1 flex">
            <Reactions activity={activity} />
          </div>
        )}
      </div>
    </li>
  );
};

/** One timeline entry: a note, or a change, link, tag or plugin event. */
export const ActivityItem = ({
  activity,
  lookups,
  last,
  pageTarget,
  pinnedList = false,
}: {
  activity: Activity;
  lookups: Lookups;
  last: boolean;
  /** Shown under "Pinned", away from its day: the time says the date too. */
  pinnedList?: boolean;
  /** The record whose timeline this is; entries of related records say whose they are. */
  pageTarget: { type: string; id: string };
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'activity' });
  const actor = actorLabel(activity.actor, lookups.members);
  const note = isNoteType(activity.type) ? readNote(activity) : null;
  const related = activity.targetType !== pageTarget.type || activity.targetId !== pageTarget.id;

  const onRelated = related && (
    <span className="text-muted-foreground">
      {' '}
      · {t('on', 'on')} <LinkedRecord type={activity.targetType} id={activity.targetId} />
    </span>
  );

  // The line joining the markers: from under this one to the next.
  const rail = !last && (
    <span
      className="absolute top-7 bottom-0 left-3 w-px -translate-x-1/2 bg-border"
      aria-hidden="true"
    />
  );

  if (note) {
    return (
      <NoteItem
        activity={activity}
        note={note}
        lookups={lookups}
        actor={actor}
        rail={rail}
        withDate={pinnedList && activity.pinned}
        heading={
          <>
            {isNamed(activity, lookups) ? (
              <span className="truncate font-medium">{actor}</span>
            ) : (
              <Skeleton className="h-3.5 w-24" />
            )}
            {onRelated}
          </>
        }
      />
    );
  }

  return (
    <EventItem
      activity={activity}
      lookups={lookups}
      actor={actor}
      onRelated={onRelated}
      rail={rail}
    />
  );
};
