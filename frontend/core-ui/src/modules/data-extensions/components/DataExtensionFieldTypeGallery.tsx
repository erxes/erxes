import { IconSearch } from '@tabler/icons-react';
import { cn, Input } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DataExtensionFieldType } from 'ui-modules';
import { FieldTypeIcon } from './fieldTypeIcons';

/** Types grouped the way people look for them, not in registry order. */
const TYPE_GROUPS: { key: string; types: DataExtensionFieldType[] }[] = [
  { key: 'text', types: ['text', 'longText', 'fullName'] },
  {
    key: 'values',
    types: ['number', 'currency', 'percent', 'rating', 'boolean'],
  },
  { key: 'dates', types: ['date', 'dateTime'] },
  { key: 'choices', types: ['select', 'multiSelect'] },
  {
    key: 'contact',
    types: ['email', 'emails', 'phone', 'phones', 'url', 'links', 'address'],
  },
  { key: 'links', types: ['relation', 'member'] },
  { key: 'advanced', types: ['files', 'json'] },
];

/**
 * The first step of a new field: every type as a card, grouped, with a
 * filter. Picking a card moves straight on to its settings.
 */
export const DataExtensionFieldTypeGallery = ({
  value,
  onSelect,
}: {
  value?: DataExtensionFieldType;
  onSelect: (type: DataExtensionFieldType) => void;
}) => {
  const { t } = useTranslation('dataExtensions');
  const [search, setSearch] = useState('');
  const query = search.trim().toLowerCase();
  const matches = (type: DataExtensionFieldType) =>
    !query ||
    `${t(`field-types.${type}`)} ${t(`field-type-hints.${type}`)} ${type}`
      .toLowerCase()
      .includes(query);
  const groups = TYPE_GROUPS.map((group) => ({
    ...group,
    types: group.types.filter(matches),
  })).filter((group) => group.types.length);

  return (
    <div className="flex flex-col gap-5">
      <div className="relative">
        <IconSearch
          aria-hidden="true"
          className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          autoFocus
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t('builder.search-types')}
          aria-label={t('builder.search-types')}
          className="pl-8"
        />
      </div>
      {groups.map((group) => (
        <section key={group.key} className="flex flex-col gap-2">
          <h3 className="text-xs font-medium text-muted-foreground">
            {t(`builder.type-groups.${group.key}`)}
          </h3>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {group.types.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => onSelect(type)}
                aria-pressed={value === type}
                className={cn(
                  'group flex items-start gap-3 rounded-md border bg-background p-3 text-left outline-hidden transition-[border-color,background-color,transform] duration-150',
                  'hover:border-primary/40 hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring motion-safe:active:scale-[0.98]',
                  value === type && 'border-primary bg-primary/5',
                )}
              >
                <span
                  className={cn(
                    'flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors',
                    'group-hover:bg-primary/10 group-hover:text-primary',
                    value === type && 'bg-primary/10 text-primary',
                  )}
                >
                  <FieldTypeIcon type={type} />
                </span>
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-sm font-medium">
                    {t(`field-types.${type}`)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {t(`field-type-hints.${type}`)}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </section>
      ))}
      {!groups.length && (
        <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
          {t('builder.no-types', { search: search.trim() })}
        </p>
      )}
    </div>
  );
};
