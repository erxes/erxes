import type { Activity, ActivityTarget, FileInfo } from '@erxes/core-contract';
import { IconProgress, IconSearch,
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
import { Badge, Button, cn, DropdownMenu, Empty, Input, RelativeDateDisplay, ScrollArea, Select, Spinner, Switch, useConfirm } from 'erxes-ui';
import { useDeferredValue } from 'react';
import { useState } from 'react';
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
import { LogInteraction, NoteHistory, Reactions } from './TimelineExtras';
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

/** A linked customer or company by name, opening its page; deleted ones say so. */
const LinkedRecord = ({ type, id }: { type: string; id: string }) => {
  if (type !== 'customer' && type !== 'company') return <span className="font-medium">{type} {id}</span>;

  return <CoreRecord type={type} id={id} />;
};

const CoreRecord = ({ type, id }: { type: ActivityTarget; id: string }) => {
  const customer = useCustomer(type === 'customer' ? id : null);
  const company = useCompany(type === 'company' ? id : null);
  const record = type === 'customer' ? customer.data : company.data;
  const name = customer.data ? customerTitle(customer.data) : company.data ? companyTitle(company.data) : null;

  if (!record) {
    return <span className="text-muted-foreground">{type === 'customer' ? 'a deleted customer' : 'a deleted company'}</span>;
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
    case 'interaction': {
      const kind = String(data.kind ?? 'call');

      return (
        <>
          {who} {t('logged', 'logged')} {t(`interaction.a-${kind}`, `a ${kind}`)}
          <span className="text-muted-foreground">
            {data.direction ? ` · ${data.direction === 'inbound' ? t('inbound', 'They reached out') : t('outbound', 'We reached out')}` : ''}
            {data.durationMinutes ? ` · ${String(data.durationMinutes)} min` : ''}
            {data.outcome ? ` · ${String(data.outcome)}` : ''}
          </span>
        </>
      );
    }
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
          <LinkedRecord type="company" id={String(data.companyId)} />
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
          <LinkedRecord type="customer" id={String(data.customerId)} />
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
}: {
  activity: Activity;
  lookups: Lookups;
  last: boolean;
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
      : verbOf(activity) === 'interaction'
        ? IconPhoneCall
        : (ICONS[verbOf(activity)] ?? IconHistory);
  const related = activity.targetType !== pageTarget.type || activity.targetId !== pageTarget.id;
  const actor = actorLabel(activity.actor, lookups.members);
  const changes = activity.data.changes as Record<string, [unknown, unknown]> | undefined;
  let extra: ReactNode = null;

  if (!plugin && changes) {
    extra = <ChangeList changes={changes} lookups={lookups} />;
  }

  if (!plugin && verbOf(activity) === 'interaction' && activity.data.body) {
    extra = <p className="mt-1 whitespace-pre-wrap text-sm">{String(activity.data.body)}</p>;
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

  const when = (
    <RelativeDateDisplay value={activity.occurredAt} asChild>
      <span className="shrink-0 text-xs text-muted-foreground">
        <RelativeDateDisplay.Value value={activity.occurredAt} />
      </span>
    </RelativeDateDisplay>
  );
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
  const rail = !last && <span className="absolute top-8 bottom-0 left-[13px] w-px bg-border" aria-hidden="true" />;

  // A note is a card: who wrote it and when, the text, its files and reactions; actions on hover.
  if (note) {
    const member = activity.actor.type === 'user' && activity.actor.id ? lookups.members.get(activity.actor.id) : undefined;

    return (
      <li className="group/note relative flex gap-3 pb-4">
        {rail}
        <UserAvatar name={actor} src={member?.avatarUrl} className="relative z-[1] size-7 shrink-0 ring-4 ring-background" />
        <div
          className={cn(
            'min-w-0 flex-1 rounded-lg border bg-background px-3.5 py-2.5 shadow-xs transition-shadow hover:shadow-sm',
            activity.pinned && 'border-primary/30 bg-primary/[0.03]',
          )}
        >
          <div className="mb-1 flex min-w-0 items-center gap-1.5 text-sm">
            <span className="truncate font-medium">{actor}</span>
            {onRelated}
            <span className="text-muted-foreground" aria-hidden="true">
              ·
            </span>
            {when}
            {edited}
            <span className="ml-auto flex shrink-0 items-center gap-0.5">
              <Reactions activity={activity} />
              {activity.pinned && <IconPin className="size-3.5 text-primary" aria-label={t('pinned', 'Pinned')} />}
              {!editing && <NoteActions activity={activity} onEdit={() => setEditing(true)} />}
            </span>
          </div>
          {extra}
        </div>
      </li>
    );
  }

  // Everything else: one line (icon, sentence, time), details below when there are any.
  return (
    <li className="group relative flex gap-3 pb-3">
      {rail}
      <span
        className="relative z-[1] flex size-7 shrink-0 items-center justify-center rounded-full border bg-background text-muted-foreground"
        style={look?.color ? { color: look.color, borderColor: look.color } : undefined}
      >
        <ItemIcon className="size-3.5" />
      </span>
      <div className="min-w-0 flex-1 pt-1">
        <div className="flex min-w-0 items-start gap-2">
          <p className="min-w-0 flex-1 text-sm leading-5">
            <Sentence activity={activity} actor={actor} lookups={lookups} />
            {onRelated}
          </p>
          {when}
        </div>
        {extra && <div className="mt-1">{extra}</div>}
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
        <div className="mt-0.5 hidden group-hover:flex">
          <Reactions activity={activity} />
        </div>
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
  const q = useDeferredValue(search.trim());
  const [actorId, setActorId] = useState('all');
  const [source, setSource] = useState('all');
  const catalog = useActivityTypes();
  const sources = [...new Set((catalog?.types ?? []).map((item) => item.source).filter((name) => name !== 'core'))];
  const { activities, loading, hasMore, loadingMore, loadMore } = useActivities(targetType, targetId, {
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
  const groups: { day: string; items: Activity[] }[] = [];

  for (const activity of activities) {
    const day = dayLabel(activity.occurredAt, t, i18n.language);
    const lastGroup = groups[groups.length - 1];

    if (lastGroup?.day === day) lastGroup.items.push(activity);
    else groups.push({ day, items: [activity] });
  }

  return (
    <ScrollArea className="min-h-0 flex-1">
      <div className="space-y-3 px-4 pt-4">
        <NoteComposer
          submitLabel={t('add-note', 'Add note')}
          saving={add.isPending}
          onSubmit={(draft) => add.mutateAsync({ targetType, targetId, ...draft })}
        />
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-md bg-muted p-0.5">
            {KINDS.map((item) => (
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
          <div className="ml-auto flex flex-wrap items-center gap-1.5">
            <div className="relative">
              <IconSearch className="pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-7 w-40 pl-7 text-xs"
                placeholder={t('search', 'Search the timeline…')}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <Select value={actorId} onValueChange={setActorId}>
              <Select.Trigger className="h-7 w-32 text-xs">
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
            {sources.length > 0 && (
              <Select value={source} onValueChange={setSource}>
                <Select.Trigger className="h-7 w-28 text-xs">
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
            )}
            <LogInteraction targetType={targetType} targetId={targetId} />
          </div>
        </div>
        {targetType === 'company' && (
          <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Switch checked={includeRelated} onCheckedChange={setIncludeRelated} />
            {t('include-customers', 'Include its customers')}
          </label>
        )}
        {pinned.length > 0 && (
          <section>
            <h3 className="flex items-center gap-1 pb-2 text-xs font-semibold text-primary uppercase">
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
                />
              ))}
            </ol>
          </section>
        )}
      </div>
      {loading ? (
        <Spinner containerClassName="py-12" />
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
        <div className="px-4 pt-2">
          {groups.map((group, groupIndex) => (
            <section key={group.day}>
              <h3 className="sticky top-0 z-10 bg-background/95 py-2 text-xs font-semibold text-muted-foreground uppercase backdrop-blur">
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
  );
};
