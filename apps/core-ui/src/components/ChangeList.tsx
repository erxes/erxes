import type { ContentType, Field, Tag, User } from '@erxes/core-contract';
import { useTranslation } from 'react-i18next';
import { memberName, useMembersById } from '~/lib/members';
import { useAllFields } from '~/modules/properties/useFields';
import { useTags } from '~/modules/tags/useTags';

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

export interface Lookups {
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

export const ChangeList = ({ changes, lookups }: { changes: Record<string, [unknown, unknown]>; lookups: Lookups }) => {
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


/**
 * Names for the values in `changes` of a customer or company: owners, tags
 * and custom fields (archived ones too).
 */
export const useChangeLookups = (
  contentType: ContentType,
  changes: (Record<string, [unknown, unknown]> | undefined)[],
  extraMemberIds: (string | null)[] = [],
): Lookups => {
  const { tags } = useTags(contentType);
  const { fields } = useAllFields(contentType);
  const { fields: archivedFields } = useAllFields(contentType, { archived: true });
  const owners = changes.flatMap((change) =>
    (change?.ownerId ?? []).map((id) => (typeof id === 'string' ? id : null)),
  );
  const members = useMembersById([...extraMemberIds, ...owners]);

  return {
    members,
    tags: new Map(tags.map((tag) => [tag.id, tag])),
    fields: new Map([...fields, ...archivedFields].map((field) => [field.id, field])),
  };
};
