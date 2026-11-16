import { IconCode } from '@tabler/icons-react';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Combobox } from '../../components/combobox';
import { Command } from '../../components/command';
import type { TConditionField } from './conditions';
import { FieldIcon } from './fieldIcons';

/** Core's own groups, in the order the picker lists them; any other (a plugin's) follows. */
const GROUPS: Record<string, string> = {
  fields: 'Fields',
  lead: 'Lead',
  company: 'Company',
  activity: 'Activity',
  custom: 'Properties',
};

const ORDER = Object.keys(GROUPS);

/** A heading per group, and one per `groupLabel` (each plugin's fields under its title). */
const groupOf = (field: TConditionField) =>
  field.groupLabel ? `label:${field.groupLabel}` : (field.group ?? 'fields');

const rank = (group: string) => {
  const at = ORDER.indexOf(group);

  return at < 0 ? ORDER.length : at;
};

/** The groups in the picker's order, each with its heading: the fields' `groupLabel`, else its name. */
const useGroups = (fields: TConditionField[]) => {
  const { t } = useTranslation('views', { keyPrefix: 'filter' });
  const groups = [...new Set(fields.map(groupOf))].toSorted((a, b) => rank(a) - rank(b));

  return groups.map((group) => {
    const inGroup = fields.filter((field) => groupOf(field) === group);
    const heading = inGroup[0]?.groupLabel ?? t(`group.${group}`, GROUPS[group] ?? group);

    return { group, heading, fields: inGroup };
  });
};

/** A path typed by hand: automations reach event payloads and step outputs the catalog lacks. */
const PATH = /^(event|subject|steps|run)(\.[A-Za-z0-9_-]+)+$/;

/**
 * The searchable list of fields, grouped under headings with each field's icon; what every
 * filter and condition editor picks a field from. `children` are rows above the fields (search,
 * the advanced filter). With `customPath`, a typed path (`event.payload.amount`) is a choice too.
 */
export const FieldPicker = ({
  fields,
  value,
  onSelect,
  children,
  customPath,
  loading,
  error,
}: {
  fields: TConditionField[];
  /** The path picked now; it shows a check. */
  value?: string;
  onSelect: (field: TConditionField) => void;
  children?: ReactNode;
  customPath?: boolean;
  loading?: boolean;
  error?: Error | null;
}) => {
  const { t } = useTranslation('views', { keyPrefix: 'filter' });
  const [search, setSearch] = useState('');
  const groups = useGroups(fields);
  const typed = search.trim();

  return (
    <Command>
      <Command.Input
        value={search}
        onValueChange={setSearch}
        placeholder={customPath ? t('field-or-path', 'Field or path…') : t('add', 'Add filter…')}
        focusOnMount
      />
      <Command.List className="max-h-popup">
        <Command.Empty>{t('no-match', 'No field matches')}</Command.Empty>
        {children}
        {loading && (
          <p className="px-2 py-1.5 text-xs text-muted-foreground">
            {t('loading', 'Loading fields…')}
          </p>
        )}
        {error && (
          <p role="alert" className="px-2 py-1.5 text-xs text-destructive">
            {error.message}
          </p>
        )}
        {customPath && PATH.test(typed) && !fields.some((field) => field.path === typed) && (
          <Command.Item
            value={`path:${typed}`}
            keywords={[typed]}
            onSelect={() => onSelect({ path: typed, label: typed, type: 'text' })}
          >
            <IconCode />
            <span className="truncate font-mono text-xs">{typed}</span>
          </Command.Item>
        )}
        {groups.map((group) => (
          <Command.Group key={group.group} heading={group.heading}>
            {group.fields.map((field) => (
              <Command.Item
                key={field.path}
                value={field.path}
                keywords={[field.label, group.heading]}
                onSelect={() => onSelect(field)}
              >
                <FieldIcon field={field} />
                <span className="truncate">{field.label}</span>
                <Combobox.Check checked={field.path === value} />
              </Command.Item>
            ))}
          </Command.Group>
        ))}
      </Command.List>
    </Command>
  );
};
