import type { Activity, ActivityTarget, Field, Tag, User } from '@erxes/core-contract';
import {
  IconArrowsJoin,
  IconHistory,
  IconLink,
  IconLinkOff,
  IconPencil,
  IconPlug,
  IconPlus,
  IconTag,
  type Icon,
} from '@tabler/icons-react';
import { Badge, Button, Empty, RelativeDateDisplay, ScrollArea, Spinner } from 'erxes-ui';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useCompany } from '~/modules/contacts/companies/useCompanies';
import { companyTitle, customerTitle } from '~/modules/contacts/components/ContactPicker';
import { useCustomer } from '~/modules/contacts/customers/useCustomers';
import { actorLabel, memberName, pluginLabel, useMembersById } from '~/lib/members';
import { useAllFields } from '~/modules/properties/useFields';
import { useTags } from '~/modules/tags/useTags';
import { useActivities } from './useActivities';

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

/** Labels for the fields core records changes of. */
const FIELD_LABELS: Record<string, string> = {
  state: 'State',
  firstName: 'First name',
  middleName: 'Middle name',
  lastName: 'Last name',
  avatarUrl: 'Avatar',
  primaryEmail: 'Primary email',
  emails: 'Emails',
  primaryPhone: 'Primary phone',
  phones: 'Phones',
  sex: 'Sex',
  birthDate: 'Birth date',
  position: 'Position',
  department: 'Department',
  code: 'Code',
  description: 'Description',
  ownerId: 'Owner',
  tagIds: 'Tags',
  primaryName: 'Name',
  names: 'Names',
  website: 'Website',
  industry: 'Industry',
  size: 'Size',
  businessType: 'Business type',
};

interface Lookups {
  members: Map<string, User>;
  tags: Map<string, Tag>;
  fields: Map<string, Field>;
}

const listOf = (values: string[]) => values.join(', ');

/** A recorded value as text: names for owners, tags and options; `—` for empty. */
const formatValue = (field: string, value: unknown, lookups: Lookups): string => {
  if (value === null || value === undefined || value === '' || (Array.isArray(value) && !value.length)) {
    return '—';
  }

  if (field === 'ownerId' && typeof value === 'string') {
    const member = lookups.members.get(value);

    return member ? memberName(member) : 'a team member';
  }

  if (field === 'tagIds' && Array.isArray(value)) {
    return listOf(value.map((id) => lookups.tags.get(String(id))?.name ?? 'a deleted tag'));
  }

  if (field === 'description' && typeof value === 'string') {
    return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 120) || '—';
  }

  if (field === 'avatarUrl') {
    return 'image';
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  if (Array.isArray(value)) {
    return listOf(value.map(String));
  }

  return String(value);
};

const fieldLabel = (field: string, lookups: Lookups, t: (key: string, fallback: string) => string) => {
  if (field.startsWith('customFields.')) {
    return lookups.fields.get(field.slice('customFields.'.length))?.label ?? t('deleted-property', 'A deleted property');
  }

  return t(`fields.${field}`, FIELD_LABELS[field] ?? field);
};

const ChangeList = ({ changes, lookups }: { changes: Record<string, [unknown, unknown]>; lookups: Lookups }) => {
  const { t } = useTranslation('common', { keyPrefix: 'activity' });

  return (
    <ul className="mt-1 space-y-0.5 text-xs">
      {Object.entries(changes).map(([field, [before, after]]) => (
        <li key={field} className="flex flex-wrap gap-1 text-muted-foreground">
          <span className="font-medium text-foreground">{fieldLabel(field, lookups, t)}:</span>
          <span className="line-through decoration-muted-foreground/50">{formatValue(field, before, lookups)}</span>
          <span aria-hidden="true">→</span>
          <span className="text-foreground">{formatValue(field, after, lookups)}</span>
        </li>
      ))}
    </ul>
  );
};

/** A linked customer or company by name, opening its page; deleted ones say so. */
const LinkedRecord = ({ type, id }: { type: ActivityTarget; id: string }) => {
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
  const record = activity.targetType === 'customer' ? t('this-customer', 'this customer') : t('this-company', 'this company');
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

const ActivityItem = ({ activity, lookups, last }: { activity: Activity; lookups: Lookups; last: boolean }) => {
  const { t } = useTranslation('common', { keyPrefix: 'activity' });
  const plugin = activity.source !== 'core';
  const ItemIcon: Icon = plugin ? IconPlug : (ICONS[verbOf(activity)] ?? IconHistory);
  const actor = actorLabel(activity.actor, lookups.members);
  const changes = activity.data.changes as Record<string, [unknown, unknown]> | undefined;
  let extra: ReactNode = null;

  if (!plugin && changes) {
    extra = <ChangeList changes={changes} lookups={lookups} />;
  }

  return (
    <li className="relative flex gap-3 pb-4">
      {!last && <span className="absolute top-7 bottom-0 left-3.5 w-px bg-border" aria-hidden="true" />}
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full border bg-background text-muted-foreground">
        <ItemIcon className="size-3.5" />
      </span>
      <div className="min-w-0 flex-1 pt-1">
        <p className="text-sm leading-5">
          <Sentence activity={activity} actor={actor} lookups={lookups} />
        </p>
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

/** What happened with a customer or company, across core and plugins. */
export const ActivityTimeline = ({ targetType, targetId }: { targetType: ActivityTarget; targetId: string }) => {
  const { t } = useTranslation('common', { keyPrefix: 'activity' });
  const { activities, loading, hasMore, loadingMore, loadMore } = useActivities(targetType, targetId);
  const { tags } = useTags(targetType);
  const { fields } = useAllFields(targetType);
  const { fields: archivedFields } = useAllFields(targetType, { archived: true });
  const memberIds = activities.flatMap((activity) => {
    const changes = activity.data.changes as Record<string, [unknown, unknown]> | undefined;
    const owners = changes?.ownerId ?? [];

    return [activity.actor.type === 'user' ? activity.actor.id : null, ...owners.map((id) => (typeof id === 'string' ? id : null))];
  });
  const members = useMembersById(memberIds);
  const lookups: Lookups = {
    members,
    tags: new Map(tags.map((tag) => [tag.id, tag])),
    fields: new Map([...fields, ...archivedFields].map((field) => [field.id, field])),
  };

  if (loading) {
    return <Spinner containerClassName="py-12" />;
  }

  if (!activities.length) {
    return (
      <Empty className="py-12">
        <Empty.Header>
          <Empty.Media variant="icon">
            <IconHistory />
          </Empty.Media>
          <Empty.Title>{t('empty', 'No activity yet')}</Empty.Title>
          <Empty.Description>
            {t('empty-description', 'Changes, tags, links and plugin events show up here.')}
          </Empty.Description>
        </Empty.Header>
      </Empty>
    );
  }

  return (
    <ScrollArea className="min-h-0 flex-1">
      <ol className="px-4 pt-4">
        {activities.map((activity, index) => (
          <ActivityItem
            key={activity.id}
            activity={activity}
            lookups={lookups}
            last={index === activities.length - 1 && !hasMore}
          />
        ))}
      </ol>
      {hasMore && (
        <div className="flex justify-center pb-4">
          <Button variant="ghost" size="sm" disabled={loadingMore} onClick={loadMore}>
            {loadingMore ? <Spinner size="sm" /> : t('load-more', 'Load more')}
          </Button>
        </div>
      )}
    </ScrollArea>
  );
};

