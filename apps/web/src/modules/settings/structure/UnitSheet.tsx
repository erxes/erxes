import type { Unit, UnitKind, UnitType } from '@erxes/core-contract';
import { Input, LookupPicker, Textarea } from 'erxes-ui';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FormSheet } from '~/components/FormSheet';
import { ContactFields, Field, PeopleFields, Section, TextField } from './UnitFields';
import { pathLabel, typesFor, useUnitMutations } from './useUnits';

/** What the sheet edits: a unit's fields, its members, and a type that may not be picked yet. */
export type Draft = Pick<
  Unit,
  'name' | 'code' | 'parentId' | 'supervisorId' | 'description' | 'address' | 'phone' | 'email'
> & { memberIds: string[]; typeId: string | null };

const draftOf = (unit: Unit | null, parentId: string | null): Draft => ({
  typeId: unit?.typeId ?? null,
  name: unit?.name ?? '',
  code: unit?.code ?? null,
  parentId: unit ? unit.parentId : parentId,
  supervisorId: unit?.supervisorId ?? null,
  description: unit?.description ?? null,
  address: unit?.address ?? null,
  phone: unit?.phone ?? null,
  email: unit?.email ?? null,
  memberIds: unit?.memberIds ?? [],
});

/** Stands for "no parent" in the parent picker. */
const TOP = '_top';

/** The units it may sit under, named by their path: never itself or one under it. */
const parentOptions = (units: Unit[], editing: Unit | null, topLabel: string) => {
  const byId = new Map(units.map((unit) => [unit.id, unit]));

  return [
    { value: TOP, label: topLabel },
    ...units
      .filter((unit) => !editing || !unit.path.startsWith(editing.path))
      .map((unit) => ({ value: unit.id, label: pathLabel(unit, byId) }))
      .toSorted((a, b) => a.label.localeCompare(b.label)),
  ];
};

/**
 * The types that fit under the chosen parent, and the one the unit gets: the picked one while it
 * fits, else the first that does.
 */
const fittingType = (types: UnitType[], units: Unit[], draft: Draft, unit: Unit | null) => {
  const parentTypeId = units.find((other) => other.id === draft.parentId)?.typeId ?? null;
  const fitting = typesFor(types, parentTypeId, unit?.typeId);

  return {
    typeId: fitting.some((type) => type.id === draft.typeId) ? draft.typeId : fitting[0]?.id,
    lookup: {
      options: fitting.map((type) => ({ value: type.id, label: type.name })),
      loading: false,
      error: null,
    },
  };
};

/** Name, code, type and where it sits. */
const PlaceFields = ({
  draft,
  set,
  units,
  types,
  unit,
  tried,
}: {
  draft: Draft;
  set: (changes: Partial<Draft>) => void;
  units: Unit[];
  types: UnitType[];
  unit: Unit | null;
  /** Save was pressed, so a missing name shows its error. */
  tried: boolean;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const ids = { name: useId(), type: useId(), parent: useId() };
  const { typeId, lookup } = fittingType(types, units, draft, unit);

  const parents = {
    options: parentOptions(units, unit, t('top-level', 'Top level')),
    loading: false,
    error: null,
  };

  return (
    <Section title={t('details', 'Details')}>
      <Field
        id={ids.name}
        label={t('name', 'Name')}
        required
        error={tried && !draft.name.trim() ? t('name-required', 'Enter a name') : null}
      >
        <Input
          id={ids.name}
          value={draft.name}
          maxLength={200}
          onChange={(event) => set({ name: event.target.value })}
        />
      </Field>
      <Field id={ids.parent} label={t('parent', 'Sits under')}>
        <LookupPicker
          lookup={parents}
          value={[draft.parentId ?? TOP]}
          onValueChange={([picked]) => set({ parentId: !picked || picked === TOP ? null : picked })}
          placeholder={t('top-level', 'Top level')}
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field id={ids.type} label={t('type', 'Type')} required>
          <LookupPicker
            lookup={lookup}
            value={typeId ? [typeId] : []}
            onValueChange={([picked]) => set({ typeId: picked ?? null })}
            placeholder={t('no-fitting-type', 'No type fits here')}
          />
        </Field>
        <TextField
          label={t('code', 'Code')}
          value={draft.code}
          onChange={(code) => set({ code })}
          placeholder={t('code-placeholder', 'Such as HQ')}
        />
      </div>
    </Section>
  );
};

/** Adds a unit of `kind`, or edits `unit`; `parentId` presets where a new one sits. */
export const UnitSheet = ({
  kind,
  unit,
  parentId,
  units,
  types,
  open,
  onOpenChange,
}: {
  kind: UnitKind;
  unit: Unit | null;
  parentId: string | null;
  units: Unit[];
  types: UnitType[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { create, update } = useUnitMutations();
  const [draft, setDraft] = useState(() => draftOf(unit, parentId));
  const set = (changes: Partial<Draft>) => setDraft((current) => ({ ...current, ...changes }));
  const [tried, setTried] = useState(false);
  const { typeId } = fittingType(types, units, draft, unit);
  const branch = kind === 'branch';

  const save = () => {
    setTried(true);

    if (!draft.name.trim() || !typeId) return;

    const fields = { ...draft, typeId, name: draft.name.trim() };
    const done = { onSuccess: () => onOpenChange(false) };

    if (unit) update.mutate({ id: unit.id, ...fields }, done);
    else create.mutate({ kind, ...fields }, done);
  };

  const title = unit
    ? branch
      ? t('edit-branch', 'Edit branch')
      : t('edit-department', 'Edit department')
    : branch
      ? t('add-branch', 'Add branch')
      : t('add-department', 'Add department');

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={
        branch
          ? t('branch-hint', 'Where people work. A branch can sit under another branch.')
          : t('department-hint', 'What people do. A department can sit under another department.')
      }
      submitLabel={unit ? t('save', 'Save') : t('add', 'Add')}
      submitting={create.isPending || update.isPending}
      onSubmit={(event) => {
        event.preventDefault();
        save();
      }}
    >
      <PlaceFields draft={draft} set={set} units={units} types={types} unit={unit} tried={tried} />
      <PeopleFields draft={draft} set={set} />
      {branch && <ContactFields draft={draft} set={set} />}
      <Section title={t('description-field', 'Description')}>
        <Textarea
          aria-label={t('description-field', 'Description')}
          placeholder={t('description-placeholder', 'What it is for, in a line or two')}
          rows={3}
          value={draft.description ?? ''}
          onChange={(event) => set({ description: event.target.value || null })}
        />
      </Section>
    </FormSheet>
  );
};
