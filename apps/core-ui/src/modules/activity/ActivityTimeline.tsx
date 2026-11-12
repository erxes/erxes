import type { Activity, ActivityTarget, FileInfo } from '@erxes/core-contract';
import { IconAdjustmentsHorizontal, IconProgress, IconSearch,
  IconArrowsJoin,
  IconHistory,
  IconLink,
  IconLinkOff,
  IconNote,
  IconPaperclip,
  IconPin,
  IconPinnedOff,
  IconDots,
  IconPencil,
  IconPlug,
  IconPlus,
  IconTag,
  IconX,
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
  type Icon,
} from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { Badge, Button, cn, DropdownMenu, Empty, Input, Popover, ScrollArea, Select, Skeleton, Spinner, Switch, useConfirm } from 'erxes-ui';
import { createContext, useContext, useDeferredValue, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useCompany } from '~/modules/contacts/companies/useCompanies';
import { companyTitle, customerTitle } from '~/modules/contacts/components/ContactPicker';
import { useCustomer } from '~/modules/contacts/customers/useCustomers';
import { ChangeList, type Lookups, useChangeLookups } from '~/components/ChangeList';
import { actorLabel, pluginLabel } from '~/lib/members';
import { api } from '~/lib/api';
import { useCan, useSession } from '~/modules/auth/session';
import { NoteComposer } from './NoteComposer';
import { UserAvatar } from '~/components/UserAvatar';
import { NoteHistory, Reactions } from './TimelineExtras';
import { type TimelineKind, useActivities, useActivityTypes, useNoteActions, usePinnedNotes } from './useActivities';

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

const verbOf = (activity: Activity) => activity.type.slice(activity.type.indexOf('.') + 1);

/** The current minute, shared by every entry so relative times move on together. */
const NowContext = createContext(Date.now());

const useMinuteClock = () => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60_000);

    return () => clearInterval(timer);
  }, []);

  return now;
};

/**
 * Short, so a line stays one line: today "now", "5m ago", "4h ago"; an
 * earlier day (its date is the heading) the time, "14:32"; `withDate` adds
 * the date where no heading gives it (pinned notes).
 */
const shortTime = (iso: string, now: number, language: string, withDate: boolean) => {
  const date = new Date(iso);
  const minutes = Math.floor((now - date.getTime()) / 60_000);

  if (date.toDateString() === new Date(now).toDateString() && minutes >= 0) {
    const relative = new Intl.RelativeTimeFormat(language, { numeric: 'auto', style: 'narrow' });

    if (minutes < 1) return relative.format(0, 'second');
    if (minutes < 60) return relative.format(-minutes, 'minute');

    return relative.format(-Math.floor(minutes / 60), 'hour');
  }

  const time = date.toLocaleTimeString(language, { hour: '2-digit', minute: '2-digit' });

  if (!withDate) return time;

  return `${date.toLocaleDateString(language, {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() === new Date(now).getFullYear() ? undefined : 'numeric',
  })}, ${time}`;
};

/** When an entry happened; the full date and time on hover. */
const When = ({ iso, withDate = false, className }: { iso: string; withDate?: boolean; className?: string }) => {
  const { i18n } = useTranslation();
  const now = useContext(NowContext);

  return (
    <time
      dateTime={iso}
      title={new Date(iso).toLocaleString(i18n.language, { dateStyle: 'full', timeStyle: 'short' })}
      className={cn('shrink-0 text-xs whitespace-nowrap text-muted-foreground tabular-nums', className)}
    >
      {shortTime(iso, now, i18n.language, withDate)}
    </time>
  );
};

/** A linked customer or company by name, opening its page; deleted ones say so. */
const LinkedRecord = ({ type, id, fallback }: { type: string; id: string; fallback?: unknown }) => {
  if (type !== 'customer' && type !== 'company') return <span className="font-medium">{type} {id}</span>;

  return <CoreRecord type={type} id={id} fallback={typeof fallback === 'string' && fallback ? fallback : undefined} />;
};

/** The name as it is now; until it loads (or after a deletion), the name saved with the entry. */
const CoreRecord = ({ type, id, fallback }: { type: ActivityTarget; id: string; fallback?: string }) => {
  const customer = useCustomer(type === 'customer' ? id : null);
  const company = useCompany(type === 'company' ? id : null);
  const query = type === 'customer' ? customer : company;
  const record = query.data;
  const name = customer.data ? customerTitle(customer.data) : company.data ? companyTitle(company.data) : null;

  if (!record && query.isPending) {
    return fallback ? (
      <span className="font-medium">{fallback}</span>
    ) : (
      <Skeleton className="inline-block h-3.5 w-20 align-middle" />
    );
  }

  if (!record) {
    return (
      <span className="text-muted-foreground" title={type === 'customer' ? 'Deleted customer' : 'Deleted company'}>
        {fallback ?? (type === 'customer' ? 'a deleted customer' : 'a deleted company')}
      </span>
    );
  }

  return (
    <Link className="font-medium hover:underline" to={`/contacts/${type === 'customer' ? 'customers' : 'companies'}/${id}`}>
      {name || id}
    </Link>
  );
};

const Sentence = ({ activity, actor, lookups }: { activity: Activity; actor: string; lookups: Lookups }) => {
  const { t } = useTranslation('common', { keyPrefix: 'activity' });
  const verb = verbOf(activity);
  const who = <span className="font-medium">{actor}</span>;
  const record =
    activity.targetType === 'customer'
      ? t('this-customer', 'this customer')
      : activity.targetType === 'company'
        ? t('this-company', 'this company')
        : t('this-record', 'this record');
  const data = activity.data as Record<string, unknown>;

  if (activity.source !== 'core') {
    return <>{activity.summary}</>;
  }

  switch (verb) {
    case 'created':
      return (
        <>
          {who} {t('created', 'created')} {record}
        </>
      );
    case 'updated':
      return (
        <>
          {who} {t('updated', 'updated')} {record}
        </>
      );
    case 'tagged': {
      const added = (data.added as string[] | undefined) ?? [];
      const removed = (data.removed as string[] | undefined) ?? [];
      const names = (ids: string[]) => ids.map((id) => lookups.tags.get(id)?.name ?? 'a deleted tag').join(', ');

      return (
        <>
          {who}{' '}
          {added.length > 0 && (
            <>
              {t('added-tags', 'added')} <span className="font-medium">{names(added)}</span>
            </>
          )}
          {added.length > 0 && removed.length > 0 && ` ${t('and', 'and')} `}
          {removed.length > 0 && (
            <>
              {t('removed-tags', 'removed')} <span className="font-medium">{names(removed)}</span>
            </>
          )}
        </>
      );
    }
    case 'merged':
      return (
        <>
          {who} {t('merged', 'merged')}{' '}
          <span className="font-medium">{((data.mergedNames as string[] | undefined) ?? []).join(', ')}</span>{' '}
          {t('into', 'into')} {record}
        </>
      );
    case 'company_linked':
    case 'company_unlinked':
      return (
        <>
          {who} {verb === 'company_linked' ? t('linked', 'linked') : t('unlinked', 'unlinked')}{' '}
          <LinkedRecord type="company" id={String(data.companyId)} fallback={data.companyName} />
        </>
      );
    case 'lead': {
      const stage = (value: unknown) => {
        const ref = value as { name?: string; color?: string } | null;

        return ref ? (
          <span className="inline-flex items-center gap-1 font-medium">
            <span className="size-2 rounded-full" style={{ background: ref.color }} />
            {ref.name}
          </span>
        ) : null;
      };
      const reason = data.reason ? <span className="text-muted-foreground"> · {String(data.reason)}</span> : null;

      switch (data.event) {
        case 'converted':
          return (
            <>
              {who} {t('lead-converted', 'converted the lead to a customer')}
            </>
          );
        case 'reopened':
          return (
            <>
              {who} {t('lead-reopened', 'made them a lead again, at')} {stage(data.to)}
              {reason}
            </>
          );
        default:
          return (
            <>
              {who} {t('lead-moved', 'moved the lead to')} {stage(data.to)}
              {reason}
            </>
          );
      }
    }
    case 'customer_linked':
    case 'customer_unlinked':
      return (
        <>
          {who} {verb === 'customer_linked' ? t('linked', 'linked') : t('unlinked', 'unlinked')}{' '}
          <LinkedRecord type="customer" id={String(data.customerId)} fallback={data.customerName} />
        </>
      );
    default:
      return (
        <>
          {who} · {activity.type}
        </>
      );
  }
};

interface NoteData {
  body: string;
  mentions: string[];
  fileIds: string[];
}

const useNoteFiles = (fileIds: string[]) =>
  useQuery({
    queryKey: ['files', 'by-id', [...fileIds].sort()],
    queryFn: () => api.files.list({ ids: fileIds.join(',') }),
    enabled: fileIds.length > 0,
    select: (page) => page.data,
  });

/** A note's text with @mentions highlighted, and its attachments. */
const NoteBody = ({ note, lookups }: { note: NoteData; lookups: Lookups }) => {
  const { data: files = [] } = useNoteFiles(note.fileIds ?? []);
  const names = (note.mentions ?? [])
    .map((id) => lookups.members.get(id))
    .filter(Boolean)
    .map((member) => `@${member!.fullName || member!.email}`);
  const pattern = names.length
    ? new RegExp(`(${names.map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'g')
    : null;

  return (
    <div>
      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
        {pattern
          ? note.body.split(pattern).map((part, index) =>
              names.includes(part) ? (
                <span key={index} className="rounded bg-primary/10 px-0.5 font-medium text-primary">
                  {part}
                </span>
              ) : (
                part
              ),
            )
          : note.body}
      </p>
      {files.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {files.map((file: FileInfo) => (
            <a
              key={file.id}
              href={`${file.url}?download=1`}
              className="flex h-6 items-center gap-1 rounded border bg-background px-2 text-xs hover:bg-accent"
            >
              <IconPaperclip className="size-3" />
              <span className="max-w-48 truncate">{file.name}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

/** Pin, edit (author) and delete (author, owners, admins) a note. */
const NoteActions = ({ activity, onEdit }: { activity: Activity; onEdit: () => void }) => {
  const { t } = useTranslation('common', { keyPrefix: 'activity' });
  const { user } = useSession();
  const { update, remove } = useNoteActions();
  const { confirm } = useConfirm();
  const mine = activity.actor.type === 'user' && activity.actor.id === user.id;
  const manager = useCan()('notes.moderate');

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-6 text-muted-foreground opacity-0 group-hover/note:opacity-100 data-[state=open]:opacity-100"
          aria-label={t('note-actions', 'Note actions')}
        >
          <IconDots className="size-3.5" />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end">
        <DropdownMenu.Item onSelect={() => update.mutate({ id: activity.id, pinned: !activity.pinned })}>
          {activity.pinned ? <IconPinnedOff /> : <IconPin />}
          {activity.pinned ? t('unpin', 'Unpin') : t('pin', 'Pin to top')}
        </DropdownMenu.Item>
        {mine && (
          <DropdownMenu.Item onSelect={onEdit}>
            <IconPencil />
            {t('edit', 'Edit')}
          </DropdownMenu.Item>
        )}
        {(mine || manager) && (
          <DropdownMenu.Item
            className="text-destructive"
            onSelect={() =>
              void confirm({ message: t('delete-note-confirm', 'Delete this note?') }).then(() => remove.mutate(activity.id))
            }
          >
            <IconX />
            {t('delete', 'Delete')}
          </DropdownMenu.Item>
        )}
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};

const isNoteType = (type: string) => type.endsWith('.note');

const ActivityItem = ({
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
  const catalog = useActivityTypes();
  const { t } = useTranslation('common', { keyPrefix: 'activity' });
  const { update } = useNoteActions();
  const [editing, setEditing] = useState(false);
  const plugin = activity.source !== 'core';
  const note = isNoteType(activity.type);
  const look = plugin ? catalog?.types.find((item) => item.type === activity.type) : undefined;
  const pluginIcon = (look?.icon && PLUGIN_ICONS[look.icon]) || IconPlug;
  const ItemIcon: Icon = plugin
    ? pluginIcon
    : note
      ? IconNote
      : (ICONS[verbOf(activity)] ?? IconHistory);
  const related = activity.targetType !== pageTarget.type || activity.targetId !== pageTarget.id;
  const actor = actorLabel(activity.actor, lookups.members);
  // Until the team is known, a placeholder rather than "A team member".
  const named =
    activity.actor.type !== 'user' || !activity.actor.id || Boolean(activity.actor.name) || lookups.members.size > 0;
  const changes = activity.data.changes as Record<string, [unknown, unknown]> | undefined;
  let extra: ReactNode = null;

  if (!plugin && changes) {
    extra = <ChangeList changes={changes} lookups={lookups} className="mt-1.5" />;
  }

  if (note) {
    const data = activity.data as unknown as NoteData;

    extra = editing ? (
      <div className="mt-1">
        <NoteComposer
          initial={data}
          submitLabel={t('save', 'Save')}
          saving={update.isPending}
          autoFocus
          onCancel={() => setEditing(false)}
          onSubmit={(draft) => update.mutateAsync({ id: activity.id, ...draft }).then(() => setEditing(false))}
        />
      </div>
    ) : (
      <NoteBody note={data} lookups={lookups} />
    );
  }

  const pinnedSection = pinnedList && activity.pinned;
  const onRelated = related && (
    <span className="text-muted-foreground">
      {' '}
      · {t('on', 'on')} <LinkedRecord type={activity.targetType} id={activity.targetId} />
    </span>
  );
  const edited =
    activity.editedAt &&
    (Array.isArray(activity.data.history) && activity.data.history.length ? (
      <NoteHistory history={activity.data.history as { body: string; editedAt: string }[]} />
    ) : (
      <span className="text-xs text-muted-foreground">· {t('edited', 'edited')}</span>
    ));
  // The line joining the markers: from under this one to the next.
  const rail = !last && <span className="absolute top-7 bottom-0 left-[11.5px] w-px bg-border" aria-hidden="true" />;
  const hasReactions = Object.keys(activity.reactions ?? {}).length > 0;

  // A note: who wrote it and when, the text, its files and reactions; actions on hover.
  if (note) {
    const member = activity.actor.type === 'user' && activity.actor.id ? lookups.members.get(activity.actor.id) : undefined;

    return (
      <li className="group/note relative flex gap-3 pb-5">
        {rail}
        <UserAvatar
          name={actor}
          src={member?.avatarUrl ?? activity.actor.avatarUrl ?? undefined}
          className="relative z-[1] size-6 shrink-0 rounded-full text-[10px] ring-4 ring-background [&>*]:rounded-full"
        />
        <div className="min-w-0 flex-1">
          <div className="flex h-6 min-w-0 items-center gap-1.5 text-sm">
            {named ? <span className="truncate font-medium">{actor}</span> : <Skeleton className="h-3.5 w-24" />}
            {onRelated}
            <When iso={activity.occurredAt} withDate={pinnedSection} />
            {edited}
            <span className="ml-auto flex shrink-0 items-center gap-0.5">
              {activity.pinned && !pinnedSection && (
                <IconPin className="size-3.5 text-muted-foreground" aria-label={t('pinned', 'Pinned')} />
              )}
              {!editing && <NoteActions activity={activity} onEdit={() => setEditing(true)} />}
            </span>
          </div>
          <div className="mt-1 text-foreground">{extra}</div>
          {!editing && (
            <div className={cn('mt-1.5 flex', !hasReactions && 'h-5 -mb-5 opacity-0 transition-opacity group-hover/note:opacity-100 has-[[data-state=open]]:opacity-100')}>
              <Reactions activity={activity} />
            </div>
          )}
        </div>
      </li>
    );
  }

  // Everything else: one line — marker, sentence, time — and details below when there are any.
  return (
    <li className="relative flex gap-3 pb-4">
      {rail}
      <span
        className="relative z-[1] flex size-6 shrink-0 items-center justify-center rounded-full border bg-background text-muted-foreground ring-4 ring-background"
        style={look?.color ? { color: look.color } : undefined}
      >
        <ItemIcon className="size-3" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm leading-6 text-muted-foreground [&_.font-medium]:text-foreground">
          {named ? <Sentence activity={activity} actor={actor} lookups={lookups} /> : <Skeleton className="mt-1 inline-block h-3.5 w-48" />}
          {onRelated}
          <When iso={activity.occurredAt} className="ml-2" />
        </p>
        {extra}
        {(plugin || activity.link) && (
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            {plugin && (
              <>
                {activity.actor.type === 'user' && <span>{actor}</span>}
                <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
                  {pluginLabel(activity.source)}
                  {look ? ` · ${look.label}` : ''}
                </Badge>
              </>
            )}
            {activity.link && (
              <Link to={activity.link} className="text-primary hover:underline">
                {t('open', 'Open')}
              </Link>
            )}
          </div>
        )}
        {hasReactions && (
          <div className="mt-1 flex">
            <Reactions activity={activity} />
          </div>
        )}
      </div>
    </li>
  );
};

const dayLabel = (iso: string, t: (key: string, fallback: string) => string, language: string) => {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date();

  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return t('today', 'Today');
  if (date.toDateString() === yesterday.toDateString()) return t('yesterday', 'Yesterday');

  return date.toLocaleDateString(language, {
    month: 'long',
    day: 'numeric',
    year: date.getFullYear() === today.getFullYear() ? undefined : 'numeric',
  });
};

const KINDS: { value: TimelineKind; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'notes', label: 'Notes' },
  { value: 'changes', label: 'Changes' },
  { value: 'plugins', label: 'Plugins' },
];

/**
 * What happened with a customer or company, across core and plugins: a note
 * box, pinned notes, then the timeline by day, filterable; a company can show
 * its customers' entries too.
 */
export const ActivityTimeline = ({ targetType, targetId }: { targetType: string; targetId: string }) => {
  const { t, i18n } = useTranslation('common', { keyPrefix: 'activity' });
  const [kind, setKind] = useState<TimelineKind>('all');
  const [includeRelated, setIncludeRelated] = useState(false);
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const now = useMinuteClock();
  const q = useDeferredValue(search.trim());
  const [actorId, setActorId] = useState('all');
  const [source, setSource] = useState('all');
  const catalog = useActivityTypes();
  const sources = [...new Set((catalog?.types ?? []).map((item) => item.source).filter((name) => name !== 'core'))];
  const { activities, loading, updating, hasMore, loadingMore, loadMore } = useActivities(targetType, targetId, {
    kind,
    includeRelated,
    q,
    actorId: actorId === 'all' ? undefined : actorId,
    source: source === 'all' ? undefined : source,
  });
  const { data: pinned = [] } = usePinnedNotes(targetType, targetId);
  const { add } = useNoteActions();
  const all = [...pinned, ...activities];
  const lookups = useChangeLookups(
    (targetType === 'company' ? 'company' : 'customer') as ActivityTarget,
    all.map((activity) => activity.data.changes as Record<string, [unknown, unknown]> | undefined),
    all.flatMap((activity) => [
      activity.actor.type === 'user' ? activity.actor.id : null,
      ...((activity.data.mentions as string[] | undefined) ?? []),
    ]),
  );
  const pageTarget = { type: targetType, id: targetId };
  const filterCount = (actorId !== 'all' ? 1 : 0) + (source !== 'all' ? 1 : 0) + (includeRelated ? 1 : 0);
  const kinds = KINDS.filter((item) => item.value !== 'plugins' || sources.length > 0);
  const closeSearch = () => {
    setSearch('');
    setSearchOpen(false);
  };
  const groups: { day: string; items: Activity[] }[] = [];

  for (const activity of activities) {
    const day = dayLabel(activity.occurredAt, t, i18n.language);
    const lastGroup = groups[groups.length - 1];

    if (lastGroup?.day === day) lastGroup.items.push(activity);
    else groups.push({ day, items: [activity] });
  }

  return (
    <NowContext.Provider value={now}>
    <ScrollArea className="min-h-0 flex-1">
      <div className="space-y-3 px-4 pt-4">
        <NoteComposer
          submitLabel={t('add-note', 'Add note')}
          saving={add.isPending}
          onSubmit={(draft) => add.mutateAsync({ targetType, targetId, ...draft })}
        />
        <div className="flex items-center gap-2">
          <div className="flex rounded-md bg-muted p-0.5">
            {kinds.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setKind(item.value)}
                className={cn(
                  'h-6 rounded px-2.5 text-xs text-muted-foreground transition-colors hover:text-foreground',
                  kind === item.value && 'bg-background font-medium text-foreground shadow-xs',
                )}
              >
                {t(`kinds.${item.value}`, item.label)}
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              className={cn('size-7 text-muted-foreground', (searchOpen || search) && 'bg-accent text-foreground')}
              aria-label={t('search', 'Search the timeline…')}
              aria-pressed={searchOpen}
              onClick={() => (searchOpen ? closeSearch() : setSearchOpen(true))}
            >
              <IconSearch className="size-4" />
            </Button>
            <Popover>
              <Popover.Trigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn('relative size-7 text-muted-foreground', filterCount > 0 && 'text-foreground')}
                  aria-label={t('filters', 'Filters')}
                >
                  <IconAdjustmentsHorizontal className="size-4" />
                  {filterCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex size-3.5 items-center justify-center rounded-full bg-primary text-[9px] font-medium text-primary-foreground">
                      {filterCount}
                    </span>
                  )}
                </Button>
              </Popover.Trigger>
              <Popover.Content align="end" className="w-64 space-y-3 p-3">
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground">{t('who', 'Who')}</p>
                  <Select value={actorId} onValueChange={setActorId}>
                    <Select.Trigger className="h-8 w-full text-sm">
                      <Select.Value />
                    </Select.Trigger>
                    <Select.Content>
                      <Select.Item value="all">{t('anyone', 'Anyone')}</Select.Item>
                      {[...lookups.members.values()].map((member) => (
                        <Select.Item key={member.id} value={member.id}>
                          {member.fullName || member.email}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                </div>
                {sources.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground">{t('source', 'Source')}</p>
                    <Select value={source} onValueChange={setSource}>
                      <Select.Trigger className="h-8 w-full text-sm">
                        <Select.Value />
                      </Select.Trigger>
                      <Select.Content>
                        <Select.Item value="all">{t('all-sources', 'All sources')}</Select.Item>
                        <Select.Item value="core">{t('core', 'Core')}</Select.Item>
                        {sources.map((name) => (
                          <Select.Item key={name} value={name}>
                            {pluginLabel(name)}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                  </div>
                )}
                {targetType === 'company' && (
                  <label className="flex items-center justify-between gap-2 text-sm">
                    {t('include-customers', 'Include its customers')}
                    <Switch checked={includeRelated} onCheckedChange={setIncludeRelated} />
                  </label>
                )}
                {filterCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-full text-xs"
                    onClick={() => {
                      setActorId('all');
                      setSource('all');
                      setIncludeRelated(false);
                    }}
                  >
                    {t('clear-filters', 'Clear filters')}
                  </Button>
                )}
              </Popover.Content>
            </Popover>
          </div>
        </div>
        {searchOpen && (
          <div className="relative">
            <IconSearch className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              className="h-8 pr-8 pl-8 text-sm"
              placeholder={t('search', 'Search the timeline…')}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Escape') closeSearch();
              }}
            />
            <button
              type="button"
              onClick={closeSearch}
              className="absolute top-1/2 right-1.5 flex size-5 -translate-y-1/2 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground"
              aria-label={t('close-search', 'Close search')}
            >
              <IconX className="size-3.5" />
            </button>
          </div>
        )}
        {pinned.length > 0 && (
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
        )}
      </div>
      {loading ? (
        <div className="space-y-5 px-4 pt-4">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="flex gap-3">
              <Skeleton className="size-6 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2 pt-1">
                <Skeleton className="h-3.5 w-1/2" />
                {index % 2 === 0 && <Skeleton className="h-3.5 w-4/5" />}
              </div>
            </div>
          ))}
        </div>
      ) : !activities.length ? (
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
      ) : (
        <div className={cn('px-4 pt-2 transition-opacity', updating && 'opacity-60')}>
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
                    last={groupIndex === groups.length - 1 && index === group.items.length - 1 && !hasMore}
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
      )}
    </ScrollArea>
    </NowContext.Provider>
  );
};
