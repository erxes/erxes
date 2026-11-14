import type { ContentType, Field, Tag, User } from '@erxes/core-contract';
import { cn } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { memberName, useMembersById } from '~/lib/members';
import { textOf } from '~/lib/text';
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
  if (
    value === null ||
    value === undefined ||
    value === '' ||
    (Array.isArray(value) && !value.length)
  ) {
    return '—';
  }

  if (field === 'ownerId' && typeof value === 'string') {
    const member = lookups.members.get(value);

    return member ? memberName(member) : 'a team member';
  }

  if (field === 'tagIds' && Array.isArray(value)) {
    return listOf(value.map((id) => lookups.tags.get(textOf(id))?.name ?? 'a deleted tag'));
  }

  if (field === 'description' && typeof value === 'string') {
    return (
      value
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 120) || '—'
    );
  }

  if (field === 'avatarUrl') {
    return 'image';
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  if (Array.isArray(value)) {
    return listOf(value.map(textOf));
  }

  return textOf(value);
};

const fieldLabel = (
  field: string,
  lookups: Lookups,
  t: (key: string, fallback: string) => string,
) => {
  if (field.startsWith('customFields.')) {
    return (
      lookups.fields.get(field.slice('customFields.'.length))?.label ??
      t('deleted-property', 'A deleted property')
    );
  }

  return t(`fields.${field}`, FIELD_LABELS[field] ?? field);
};

/**
 * What changed, field by field: the old value struck through, then the new
 * one; a value set for the first time shows only the new one.
 */
export const ChangeList = ({
  changes,
  lookups,
  className,
}: {
  changes: Record<string, [unknown, unknown]>;
  lookups: Lookups;
  className?: string;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'activity' });

  return (
    <dl
      className={cn(
        'grid grid-cols-leading gap-x-3 gap-y-1 rounded-md bg-muted/60 px-2.5 py-1.5 text-xs',
        className,
      )}
    >
      {Object.entries(changes).map(([field, [before, after]]) => {
        const from = formatValue(field, before, lookups);
        const to = formatValue(field, after, lookups);

        return (
          <div key={field} className="contents">
            <dt className="text-muted-foreground">{fieldLabel(field, lookups, t)}</dt>
            <dd className="min-w-0 break-words text-foreground">
              {from !== '—' && (
                <>
                  <span className="text-muted-foreground line-through decoration-muted-foreground/60">
                    {from}
                  </span>
                  <span className="px-1 text-muted-foreground" aria-hidden="true">
                    →
                  </span>
                </>
              )}
              {to === '—' ? (
                <span className="text-muted-foreground italic">{t('cleared', 'cleared')}</span>
              ) : (
                to
              )}
            </dd>
          </div>
        );
      })}
    </dl>
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
