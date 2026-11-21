import type { DataExtensionField } from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import { useMutation } from '@tanstack/react-query';
import { Separator } from 'erxes-ui';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FormSheet } from '~/components/FormSheet';
import { useFields, useRefreshDataModel } from '../../dataQueries';
import { FormError } from '../../form/DraftEditor';
import { useDataErrorText } from '../../useDataErrors';
import { AccessSettings } from './AccessSettings';
import { ConditionEditor } from './ConditionEditor';
import { draftBody, draftOf, type FieldDraft, newDraft, type SetSettings } from './fieldDraft';
import { GeneralSettings } from './GeneralSettings';
import { TypeSettings } from './TypeSettings';

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="flex flex-col gap-3">
    <Separator />
    <h3 className="text-sm font-semibold">{title}</h3>
    {children}
  </section>
);

/** Adds the draft as a new field of `recordType`, or saves it over `field`. */
const useFieldSave = (
  recordType: string,
  field: DataExtensionField | undefined,
  onDone: () => void,
) => {
  const refresh = useRefreshDataModel();
  const errorText = useDataErrorText();
  const handlers = { onSuccess: () => void refresh().then(onDone) };
  const create = useMutation(orpc.dataFields.create.mutationOptions(handlers));
  const update = useMutation(orpc.dataFields.update.mutationOptions(handlers));
  const error = create.error ?? update.error;

  const save = (draft: FieldDraft) => {
    const { type } = draft;
    const body = draftBody(draft);

    // A relation is made in pairs by the relation dialog; this sheet only edits one.
    if (!field && type !== 'relation') {
      create.mutate({
        ...body,
        recordType,
        type,
        key: draft.key,
        description: draft.description || undefined,
        icon: draft.icon ?? undefined,
        groupId: draft.groupId ?? undefined,
      });

      return;
    }

    if (!field) return;

    update.mutate({
      ...body,
      id: field.id,
      key: draft.key === field.key ? undefined : draft.key,
      description: draft.description || null,
      icon: draft.icon,
      groupId: draft.groupId,
    });
  };

  return {
    save,
    saving: create.isPending || update.isPending,
    error: error ? errorText(error) : null,
  };
};

/** The sheet's body: general, type, conditions, then rules and access. */
const FieldSettings = ({
  recordType,
  field,
  draft,
  setDraft,
}: {
  recordType: string;
  field?: DataExtensionField;
  draft: FieldDraft;
  setDraft: (update: (draft: FieldDraft) => FieldDraft) => void;
}) => {
  const { t } = useTranslation('data', { keyPrefix: 'field' });
  const others = useFields(recordType).fields.filter((entry) => entry.id !== field?.id);
  const set = (patch: Partial<FieldDraft>) => setDraft((current) => ({ ...current, ...patch }));

  const setSettings: SetSettings = (patch) =>
    setDraft((current) => ({ ...current, settings: { ...current.settings, ...patch } }));

  return (
    <>
      <GeneralSettings
        recordType={recordType}
        draft={draft}
        set={set}
        setSettings={setSettings}
        creating={!field}
      />
      <TypeSettings recordType={recordType} draft={draft} set={set} setSettings={setSettings} />
      <Section title={t('conditions', 'Conditions')}>
        <ConditionEditor
          label={t('visible-when', 'Show only while')}
          condition={draft.settings.visibleWhen}
          fields={others}
          onChange={(visibleWhen) => setSettings({ visibleWhen })}
        />
        <ConditionEditor
          label={t('hidden-when', 'Hide while')}
          condition={draft.settings.hiddenWhen}
          fields={others}
          onChange={(hiddenWhen) => setSettings({ hiddenWhen })}
        />
        <ConditionEditor
          label={t('required-when', 'Required while')}
          condition={draft.settings.requiredWhen}
          fields={others}
          onChange={(requiredWhen) => setSettings({ requiredWhen })}
        />
      </Section>
      <Section title={t('rules', 'Rules and access')}>
        <AccessSettings type={draft.type} settings={draft.settings} setSettings={setSettings} />
      </Section>
    </>
  );
};

const SheetForm = ({
  recordType,
  field,
  onOpenChange,
}: {
  recordType: string;
  field?: DataExtensionField;
  onOpenChange: (open: boolean) => void;
}) => {
  const { t } = useTranslation('data', { keyPrefix: 'field' });
  const [draft, setDraft] = useState(() => (field ? draftOf(field) : newDraft()));
  const { save, saving, error } = useFieldSave(recordType, field, () => onOpenChange(false));

  return (
    <FormSheet
      open
      onOpenChange={onOpenChange}
      title={field ? t('edit', 'Edit {{label}}', { label: field.label }) : t('add', 'Add field')}
      description={t(
        'sheet-description',
        'Fields show on every record of this type, in the order of the list.',
      )}
      submitting={saving}
      onSubmit={(event) => {
        event.preventDefault();
        save(draft);
      }}
    >
      <FormError message={error} />
      <FieldSettings recordType={recordType} field={field} draft={draft} setDraft={setDraft} />
    </FormSheet>
  );
};

/** Adds a field to a record type, or edits one: open while `open`. */
export const FieldSheet = ({
  recordType,
  field,
  open,
  onOpenChange,
}: {
  recordType: string;
  field?: DataExtensionField;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) =>
  open ? <SheetForm recordType={recordType} field={field} onOpenChange={onOpenChange} /> : null;
