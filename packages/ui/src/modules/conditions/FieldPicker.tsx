import { IconApps, IconChevronLeft, IconChevronRight, IconCode } from '@tabler/icons-react';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Combobox } from '../../components/combobox';
import { Command } from '../../components/command';
import type { TConditionField } from './conditions';
import {
  appOf,
  appSections,
  CORE_GROUPS,
  coreSections,
  type FieldApp,
  type FieldSection,
  fieldApps,
  matchField,
} from './fieldGroups';
import { FieldIcon } from './fieldIcons';

/** A path typed by hand: automations reach event payloads and step outputs the catalog lacks. */
const PATH = /^(event|subject|steps|run)(\.[A-Za-z0-9_-]+)+$/;

const Sections = ({
  sections,
  value,
  onSelect,
}: {
  sections: FieldSection[];
  value?: string;
  onSelect: (field: TConditionField) => void;
}) => {
  const { t } = useTranslation('views', { keyPrefix: 'filter' });

  return sections.map((section) => {
    const heading = section.literal
      ? section.heading
      : t(`group.${section.heading}`, CORE_GROUPS[section.heading] ?? section.heading);

    return (
      <Command.Group key={section.key} heading={heading}>
        {section.fields.map(({ field, label }) => (
          <Command.Item
            key={field.path}
            value={field.path}
            keywords={[field.label, heading]}
            onSelect={() => onSelect(field)}
          >
            <FieldIcon field={field} />
            <span className="truncate">{label}</span>
            <Combobox.Check checked={field.path === value} />
          </Command.Item>
        ))}
      </Command.Group>
    );
  });
};

/** One row per plugin: its title and field count; picking it opens the plugin's page. */
const Apps = ({ apps, onOpen }: { apps: FieldApp[]; onOpen: (app: string) => void }) => {
  const { t } = useTranslation('views', { keyPrefix: 'filter' });

  if (!apps.length) return null;

  return (
    <Command.Group heading={t('group.apps', 'Apps')}>
      {apps.map((app) => (
        <Command.Item
          key={app.key}
          value={`app:${app.key}`}
          keywords={[app.title]}
          onSelect={() => onOpen(app.key)}
        >
          <IconApps />
          <span className="truncate">{app.title}</span>
          <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
            {app.count}
            <IconChevronRight className="size-3.5" />
          </span>
        </Command.Item>
      ))}
    </Command.Group>
  );
};

/** While the fields load, and why they didn't. */
const FieldsState = ({ loading, error }: { loading?: boolean; error?: Error | null }) => {
  const { t } = useTranslation('views', { keyPrefix: 'filter' });

  return (
    <>
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
    </>
  );
};

/** One plugin's fields, with a row back to all of them; Backspace in the empty search goes back too. */
const AppPage = ({
  title,
  sections,
  value,
  onSelect,
  onBack,
}: {
  title: string;
  sections: FieldSection[];
  value?: string;
  onSelect: (field: TConditionField) => void;
  onBack: () => void;
}) => {
  const { t } = useTranslation('views', { keyPrefix: 'filter' });
  const [search, setSearch] = useState('');

  return (
    <Command
      filter={matchField}
      onKeyDown={(event) => {
        if (event.key === 'Backspace' && !search) onBack();
      }}
    >
      <Command.Input
        value={search}
        onValueChange={setSearch}
        placeholder={t('search-in', { app: title, defaultValue: 'Search {{app}}…' })}
        focusOnMount
      />
      <Command.List className="max-h-popup">
        <Command.Empty>{t('no-match', 'No field matches')}</Command.Empty>
        <Command.Group>
          <Command.Item value="back" keywords={[title]} onSelect={onBack}>
            <IconChevronLeft />
            <span className="truncate">{t('all-fields', 'All fields')}</span>
          </Command.Item>
        </Command.Group>
        <Sections sections={sections} value={value} onSelect={onSelect} />
      </Command.List>
    </Command>
  );
};

/**
 * The searchable list of fields; what every filter and condition editor picks a field from.
 * Each plugin is one row ("Ecommerce 14") that opens a page of its fields, so many plugins
 * don't make one long list; core's fields follow under their groups' headings. Typing searches
 * every field by its words, plugins' too. `children` are rows above the fields (search, the advanced
 * filter). With `customPath`, a typed path (`event.payload.amount`) is a choice too.
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
  /** The path picked now; it shows a check, and the picker opens on its plugin's page. */
  value?: string;
  onSelect: (field: TConditionField) => void;
  children?: ReactNode;
  customPath?: boolean;
  loading?: boolean;
  error?: Error | null;
}) => {
  const { t } = useTranslation('views', { keyPrefix: 'filter' });
  const [search, setSearch] = useState('');

  const [app, setApp] = useState(() => {
    const picked = fields.find((field) => field.path === value);

    return picked ? appOf(picked) : undefined;
  });

  const apps = fieldApps(fields);
  const title = apps.find((one) => one.key === app)?.title;
  const typed = search.trim();

  const open = (next: string | undefined) => {
    setApp(next);
    setSearch('');
  };

  if (app && title) {
    return (
      <AppPage
        title={title}
        sections={appSections(fields, app)}
        value={value}
        onSelect={onSelect}
        onBack={() => open(undefined)}
      />
    );
  }

  return (
    <Command filter={matchField}>
      <Command.Input
        value={search}
        onValueChange={setSearch}
        placeholder={customPath ? t('field-or-path', 'Field or path…') : t('add', 'Add filter…')}
        focusOnMount
      />
      <Command.List className="max-h-popup">
        <Command.Empty>{t('no-match', 'No field matches')}</Command.Empty>
        {children}
        <FieldsState loading={loading} error={error} />
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
        <Apps apps={apps} onOpen={open} />
        <Sections sections={coreSections(fields)} value={value} onSelect={onSelect} />
        {typed &&
          apps.map((one) => (
            <Sections
              key={one.key}
              sections={appSections(fields, one.key, true)}
              value={value}
              onSelect={onSelect}
            />
          ))}
      </Command.List>
    </Command>
  );
};
