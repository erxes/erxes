import type { Import, ImportOptions } from '@erxes/core-contract';
import { useQuery } from '@tanstack/react-query';
import { cn, Label, MultipleSelector, Select, Switch } from 'erxes-ui';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { messageOf } from '~/lib/api';
import { activeMembersQuery, memberName } from '~/lib/members';
import { useTags } from '~/modules/tags/useTags';
import { useTransferColumns } from '~/modules/transfer/useTransfer';

const IGNORE = '__ignore__';
const MODES = ['create', 'upsert', 'update'] as const;
const MATCH_BY = ['name', 'email', 'phone', 'code', 'id'] as const;

export type ImportChanges = { mapping?: Record<string, string>; options?: Partial<ImportOptions> };

type SetupProps = { imp: Import; disabled: boolean; onChange: (changes: ImportChanges) => void };

const MappingRow = ({
  imp,
  index,
  header,
  fields,
  disabled,
  onChange,
}: SetupProps & { index: number; header: string; fields: { key: string; label: string }[] }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'import-export' });
  const value = imp.mapping[String(index)] ?? IGNORE;

  const samples = imp.sample
    .map((row) => row[index])
    .filter(Boolean)
    .slice(0, 3);

  const pick = (key: string) => {
    const mapping = Object.fromEntries(
      Object.entries(imp.mapping).filter(
        ([column, field]) => column !== String(index) && field !== key,
      ),
    );

    if (key !== IGNORE) mapping[String(index)] = key;
    onChange({ mapping });
  };

  return (
    <div className="grid grid-cols-[1fr_1fr_16rem] items-center gap-3 p-2 text-sm">
      <span className="truncate font-medium">{header}</span>
      <span className="truncate text-xs text-muted-foreground">
        {samples.join(' · ') || t('empty', '(empty)')}
      </span>
      <Select value={value} disabled={disabled} onValueChange={pick}>
        <Select.Trigger
          aria-label={header}
          className={cn('h-8', value === IGNORE && 'text-muted-foreground')}
        >
          <Select.Value />
        </Select.Trigger>
        <Select.Content>
          <Select.Item value={IGNORE}>{t('ignore', "Don't import")}</Select.Item>
          {fields.map((field) => (
            <Select.Item key={field.key} value={field.key}>
              {field.label}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
    </div>
  );
};

/** Which field each of the file's columns fills (suggested from the names, with sample values). */
export const ImportMapping = (props: SetupProps) => {
  const { t } = useTranslation('settings', { keyPrefix: 'import-export' });
  const columns = useTransferColumns(props.imp.recordType);
  const fields = (columns.data ?? []).filter((column) => column.importable);

  return (
    <section className="space-y-2">
      <h2 className="text-sm font-medium">{t('mapping', 'Columns')}</h2>
      <p className="text-xs text-muted-foreground">
        {t(
          'mapping-hint',
          'Suggested from the column names; choose another field or leave a column out.',
        )}
      </p>
      {columns.error && <p className="text-sm text-destructive">{messageOf(columns.error)}</p>}
      <div className="divide-y rounded-lg border">
        {props.imp.headers.map((header, index) => (
          <MappingRow key={index} {...props} index={index} header={header} fields={fields} />
        ))}
      </div>
    </section>
  );
};

const OptionSelect = ({
  label,
  value,
  items,
  onChange,
}: {
  label: string;
  value: string;
  items: { value: string; label: string }[];
  onChange: (value: string) => void;
}) => {
  const id = useId();

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <Select.Trigger id={id}>
          <Select.Value />
        </Select.Trigger>
        <Select.Content>
          {items.map((item) => (
            <Select.Item key={item.value} value={item.value}>
              {item.label}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
    </div>
  );
};

const useOptionLabels = (isCompany: boolean) => {
  const { t } = useTranslation('settings', { keyPrefix: 'import-export' });
  const members = useQuery(activeMembersQuery());

  const modes: Record<ImportOptions['mode'], string> = {
    create: t('mode-create', 'Skip them (create new ones only)'),
    upsert: t('mode-upsert', 'Update them, create the rest'),
    update: t('mode-update', 'Update them, create nothing'),
  };

  const matchBy: Record<ImportOptions['matchBy'], string> = {
    name: t('match-name', 'Name'),
    email: t('match-email', 'Email'),
    phone: t('match-phone', 'Phone'),
    code: t('match-code', 'Code'),
    id: t('match-id', 'ID (from an erxes export)'),
  };

  return {
    modes: MODES.map((value) => ({ value, label: modes[value] })),
    matchBy: MATCH_BY.filter((value) => isCompany || value !== 'name').map((value) => ({
      value,
      label: matchBy[value],
    })),
    owners: [
      { value: 'none', label: t('no-owner', 'No owner') },
      ...(members.data?.data ?? []).map((user) => ({ value: user.id, label: memberName(user) })),
    ],
    membersError: members.error,
  };
};

const TagsOption = ({ imp, onChange }: Omit<SetupProps, 'disabled'>) => {
  const { t } = useTranslation('settings', { keyPrefix: 'import-export' });
  const { tags, error } = useTags(imp.recordType === 'company' ? 'company' : 'customer');
  const options = tags.map((tag) => ({ value: tag.id, label: tag.name }));

  return (
    <div className="space-y-1.5">
      <Label>{t('add-tags', 'Add these tags to every row')}</Label>
      <MultipleSelector
        value={(imp.options.tagIds ?? []).map(
          (tagId) => options.find((tag) => tag.value === tagId) ?? { value: tagId, label: tagId },
        )}
        options={options}
        hidePlaceholderWhenSelected
        onChange={(next) => onChange({ options: { tagIds: next.map((item) => item.value) } })}
      />
      {error && <p className="text-sm text-destructive">{messageOf(error)}</p>}
    </div>
  );
};

/** How rows find existing records, and what every imported record gets. */
export const ImportOptionsForm = ({ imp, onChange }: Omit<SetupProps, 'disabled'>) => {
  const { t } = useTranslation('settings', { keyPrefix: 'import-export' });
  const isCompany = imp.recordType === 'company';
  const labels = useOptionLabels(isCompany);
  const { options } = imp;

  return (
    <section className="grid gap-4 rounded-lg border p-4 sm:grid-cols-2">
      <OptionSelect
        label={t('mode', 'Rows that match an existing record')}
        value={options.mode}
        items={labels.modes}
        onChange={(value) => {
          const mode = MODES.find((item) => item === value);

          if (mode) onChange({ options: { mode } });
        }}
      />
      <OptionSelect
        label={t('match-by', 'Match by')}
        value={options.matchBy}
        items={labels.matchBy}
        onChange={(value) => {
          const matchBy = MATCH_BY.find((item) => item === value);

          if (matchBy) onChange({ options: { matchBy } });
        }}
      />
      <TagsOption imp={imp} onChange={onChange} />
      <div>
        <OptionSelect
          label={t('owner', 'Owner of new records (unless the file names one)')}
          value={options.ownerId ?? 'none'}
          items={labels.owners}
          onChange={(ownerId) =>
            onChange({ options: { ownerId: ownerId === 'none' ? null : ownerId } })
          }
        />
        {labels.membersError && (
          <p className="text-sm text-destructive">{messageOf(labels.membersError)}</p>
        )}
      </div>
      <label className="flex items-center gap-2 text-sm">
        <Switch
          checked={options.createMissing}
          onCheckedChange={(createMissing) => onChange({ options: { createMissing } })}
        />
        {isCompany
          ? t('create-missing-tags', 'Create tags the file names but erxes lacks')
          : t('create-missing', 'Create tags and companies the file names but erxes lacks')}
      </label>
      <label className="flex items-center gap-2 text-sm">
        <Switch
          checked={options.runAutomations}
          onCheckedChange={(runAutomations) => onChange({ options: { runAutomations } })}
        />
        {t('run-automations', 'Start automations and notify owners for imported records')}
      </label>
    </section>
  );
};
