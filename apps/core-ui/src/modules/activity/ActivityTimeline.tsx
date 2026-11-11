import type { Activity, ActivityTarget, FileInfo } from '@erxes/core-contract';
import {
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
  type Icon,
} from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import {
  Badge,
  Button,
  cn,
  DropdownMenu,
  Empty,
  RelativeDateDisplay,
  ScrollArea,
  Spinner,
  Switch,
  useConfirm,
} from 'erxes-ui';
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
import { useSession } from '~/modules/auth/session';
import { NoteComposer } from './NoteComposer';
import { type TimelineKind, useActivities, useNoteActions, usePinnedNotes } from './useActivities';

const ICONS: Record<string, Icon> = {
  created: IconPlus,
  updated: IconPencil,
  tagged: IconTag,
  merged: IconArrowsJoin,
  company_linked: IconLink,
  customer_linked: IconLink,
  company_unlinked: IconLinkOff,
  customer_unlinked: IconLinkOff,
};

const verbOf = (activity: Activity) => activity.type.slice(activity.type.indexOf('.') + 1);

/** A linked customer or company by name, opening its page; deleted ones say so. */
const LinkedRecord = ({ type, id }: { type: ActivityTarget; id: string }) => {
  const customer = useCustomer(type === 'customer' ? id : null);
  const company = useCompany(type === 'company' ? id : null);
  const record = type === 'customer' ? customer.data : company.data;
  const name = customer.data
    ? customerTitle(customer.data)
    : company.data
      ? companyTitle(company.data)
      : null;

  if (!record) {
    return (
      <span className="text-muted-foreground">
        {type === 'customer' ? 'a deleted customer' : 'a deleted company'}
      </span>
    );
  }

  return (
    <Link
      className="font-medium hover:underline"
      to={`/contacts/${type === 'customer' ? 'customers' : 'companies'}/${id}`}
    >
      {name || id}
    </Link>
  );
};

const Sentence = ({
  activity,
  actor,
  lookups,
}: {
  activity: Activity;
  actor: string;
  lookups: Lookups;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'activity' });
  const verb = verbOf(activity);
  const who = <span className="font-medium">{actor}</span>;
  const record =
    activity.targetType === 'customer'
      ? t('this-customer', 'this customer')
      : t('this-company', 'this company');
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
      const names = (ids: string[]) =>
        ids.map((id) => lookups.tags.get(id)?.name ?? 'a deleted tag').join(', ');

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
          <span className="font-medium">
            {((data.mergedNames as string[] | undefined) ?? []).join(', ')}
          </span>{' '}
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
    ? new RegExp(
        `(${names.map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`,
        'g',
      )
    : null;

  return (
    <div className="mt-1 rounded-md border bg-muted/30 px-3 py-2">
      <p className="text-sm whitespace-pre-wrap">
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
  const manager = user.role !== 'member';

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-6 opacity-0 group-hover:opacity-100"
          aria-label={t('note-actions', 'Note actions')}
        >
          <IconDots className="size-3.5" />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end">
        <DropdownMenu.Item
          onSelect={() => update.mutate({ id: activity.id, pinned: !activity.pinned })}
        >
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
              void confirm({ message: t('delete-note-confirm', 'Delete this note?') }).then(() =>
                remove.mutate(activity.id),
              )
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
  pageTarget: { type: ActivityTarget; id: string };
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'activity' });
  const { update } = useNoteActions();
  const [editing, setEditing] = useState(false);
  const plugin = activity.source !== 'core';
  const note = isNoteType(activity.type);
  const ItemIcon: Icon = plugin
    ? IconPlug
    : note
      ? IconNote
      : (ICONS[verbOf(activity)] ?? IconHistory);
  const related = activity.targetType !== pageTarget.type || activity.targetId !== pageTarget.id;
  const actor = actorLabel(activity.actor, lookups.members);
  const changes = activity.data.changes as Record<string, [unknown, unknown]> | undefined;
  let extra: ReactNode = null;

  if (!plugin && changes) {
    extra = <ChangeList changes={changes} lookups={lookups} />;
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
          onSubmit={(draft) =>
            update.mutateAsync({ id: activity.id, ...draft }).then(() => setEditing(false))
          }
        />
      </div>
    ) : (
      <NoteBody note={data} lookups={lookups} />
    );
  }

  return (
    <li className="group relative flex gap-3 pb-4">
      {!last && (
        <span className="absolute top-7 bottom-0 left-3.5 w-px bg-border" aria-hidden="true" />
      )}
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full border bg-background text-muted-foreground">
        <ItemIcon className="size-3.5" />
      </span>
      <div className="min-w-0 flex-1 pt-1">
        <div className="flex items-start gap-1">
          <p className="flex-1 text-sm leading-5">
            {note ? (
              <>
                <span className="font-medium">{actor}</span> {t('wrote-note', 'wrote a note')}
              </>
            ) : (
              <Sentence activity={activity} actor={actor} lookups={lookups} />
            )}
            {related && (
              <span className="text-muted-foreground">
                {' '}
                · {t('on', 'on')} <LinkedRecord type={activity.targetType} id={activity.targetId} />
              </span>
            )}
          </p>
          {activity.pinned && (
            <IconPin className="mt-0.5 size-3.5 text-primary" aria-label={t('pinned', 'Pinned')} />
          )}
          {note && !editing && <NoteActions activity={activity} onEdit={() => setEditing(true)} />}
        </div>
        {extra}
        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <RelativeDateDisplay value={activity.occurredAt} asChild>
            <span>
              <RelativeDateDisplay.Value value={activity.occurredAt} />
            </span>
          </RelativeDateDisplay>
          {plugin && (
            <>
              <span aria-hidden="true">·</span>
              {activity.actor.type === 'user' && <span>{actor}</span>}
              <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
                {pluginLabel(activity.source)}
              </Badge>
            </>
          )}
          {activity.editedAt && <span>· {t('edited', 'edited')}</span>}
          {activity.link && (
            <Link to={activity.link} className="text-primary hover:underline">
              {t('open', 'Open')}
            </Link>
          )}
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
export const ActivityTimeline = ({
  targetType,
  targetId,
}: {
  targetType: ActivityTarget;
  targetId: string;
}) => {
  const { t, i18n } = useTranslation('common', { keyPrefix: 'activity' });
  const [kind, setKind] = useState<TimelineKind>('all');
  const [includeRelated, setIncludeRelated] = useState(false);
  const { activities, loading, hasMore, loadingMore, loadMore } = useActivities(
    targetType,
    targetId,
    { kind, includeRelated },
  );
  const { data: pinned = [] } = usePinnedNotes(targetType, targetId);
  const { add } = useNoteActions();
  const all = [...pinned, ...activities];
  const lookups = useChangeLookups(
    targetType,
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
        {pinned.length > 0 && (
          <section className="rounded-lg border border-primary/30 bg-primary/5 px-3 pt-3">
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
        <div className="flex flex-wrap items-center gap-1">
          {KINDS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setKind(item.value)}
              className={cn(
                'h-6 rounded-full border px-2.5 text-xs',
                kind === item.value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent',
              )}
            >
              {t(`kinds.${item.value}`, item.label)}
            </button>
          ))}
          {targetType === 'company' && (
            <label className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
              <Switch checked={includeRelated} onCheckedChange={setIncludeRelated} />
              {t('include-customers', 'Include its customers')}
            </label>
          )}
        </div>
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
              {t(
                'empty-description',
                'Notes, changes, tags, links and plugin events show up here.',
              )}
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
                    last={
                      groupIndex === groups.length - 1 &&
                      index === group.items.length - 1 &&
                      !hasMore
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
      )}
    </ScrollArea>
  );
};
