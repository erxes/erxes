import type { Unit, UnitKind, UnitType } from '@erxes/core-contract';
import { memberQueries } from '@erxes/core-contract/client';
import {
  Button,
  Dialog,
  Input,
  Label,
  LookupPicker,
  SelectMember,
  Textarea,
  useMemberOptions,
} from 'erxes-ui';
import { type ReactNode, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { treeRows, typesFor, useUnitMutations } from './useUnits';

const Field = ({ id, label, children }: { id: string; label: string; children: ReactNode }) => (
  <div className="space-y-1.5">
    <Label htmlFor={id}>{label}</Label>
    {children}
  </div>
);

/** A text field that keeps `null` for empty. */
const TextField = ({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string | null;
  onChange: (value: string | null) => void;
  type?: 'text' | 'email' | 'tel';
}) => {
  const id = useId();

  return (
    <Field id={id} label={label}>
      <Input
        id={id}
        type={type}
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value || null)}
      />
    </Field>
  );
};

/** The units it may sit under: the same kind, never itself or one under it. */
const parentOptions = (units: Unit[], editing: Unit | null) =>
  treeRows(units)
    .filter(({ unit }) => !editing || !unit.path.startsWith(editing.path))
    .map(({ unit, depth }) => ({ value: unit.id, label: `${'— '.repeat(depth)}${unit.name}` }));

/** A branch's address, phone and email. */
const ContactFields = ({
  draft,
  set,
}: {
  draft: Draft;
  set: (changes: Partial<Draft>) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });

  return (
    <>
      <TextField
        label={t('address', 'Address')}
        value={draft.address}
        onChange={(address) => set({ address })}
      />
      <TextField
        label={t('phone', 'Phone')}
        type="tel"
        value={draft.phone}
        onChange={(phone) => set({ phone })}
      />
      <TextField
        label={t('email', 'Email')}
        type="email"
        value={draft.email}
        onChange={(email) => set({ email })}
      />
    </>
  );
};

type Draft = Pick<
  Unit,
  'name' | 'code' | 'parentId' | 'supervisorId' | 'description' | 'address' | 'phone' | 'email'
> & { memberIds: string[]; typeId: string | null };

const draftOf = (unit: Unit | null): Draft => ({
  typeId: unit?.typeId ?? null,
  name: unit?.name ?? '',
  code: unit?.code ?? null,
  parentId: unit?.parentId ?? null,
  supervisorId: unit?.supervisorId ?? null,
  description: unit?.description ?? null,
  address: unit?.address ?? null,
  phone: unit?.phone ?? null,
  email: unit?.email ?? null,
  memberIds: unit?.memberIds ?? [],
});

/** Who leads the unit and who is in it. */
const PeopleFields = ({ draft, set }: { draft: Draft; set: (changes: Partial<Draft>) => void }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const memberOptions = useMemberOptions(memberQueries, true, draft.memberIds);
  const ids = { supervisor: useId(), members: useId() };

  return (
    <>
      <Field id={ids.supervisor} label={t('supervisor', 'Supervisor')}>
        <SelectMember.Field
          id={ids.supervisor}
          value={draft.supervisorId}
          onValueChange={(supervisorId) => set({ supervisorId })}
          members={memberQueries}
          noneLabel={t('no-supervisor', 'No supervisor')}
          placeholder={t('no-supervisor', 'No supervisor')}
        />
      </Field>
      <Field id={ids.members} label={t('members', 'Members')}>
        <LookupPicker
          lookup={memberOptions}
          multiple
          value={draft.memberIds}
          onValueChange={(memberIds) => set({ memberIds })}
          placeholder={t('pick-members', 'Choose team members')}
        />
      </Field>
    </>
  );
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

/** Mounted while the dialog is open, so closing it drops what was typed. */
const UnitForm = ({
  kind,
  unit,
  units,
  types,
  onDone,
}: {
  kind: UnitKind;
  unit: Unit | null;
  units: Unit[];
  types: UnitType[];
  onDone: () => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { create, update } = useUnitMutations();
  const [draft, setDraft] = useState(() => draftOf(unit));
  const set = (changes: Partial<Draft>) => setDraft((current) => ({ ...current, ...changes }));
  const parents = { options: parentOptions(units, unit), loading: false, error: null };
  const ids = { name: useId(), type: useId(), parent: useId() };
  const saving = create.isPending || update.isPending;
  const { typeId, lookup: typeLookup } = fittingType(types, units, draft, unit);

  const save = () => {
    const fields = { ...draft, typeId: typeId ?? undefined, name: draft.name.trim() };
    const done = { onSuccess: onDone };

    if (unit) update.mutate({ id: unit.id, ...fields }, done);
    else create.mutate({ kind, ...fields }, done);
  };

  return (
    <div className="space-y-4">
      <Field id={ids.name} label={t('name', 'Name')}>
        <Input
          id={ids.name}
          value={draft.name}
          maxLength={200}
          onChange={(event) => set({ name: event.target.value })}
        />
      </Field>
      <TextField label={t('code', 'Code')} value={draft.code} onChange={(code) => set({ code })} />
      <Field id={ids.type} label={t('type', 'Type')}>
        <LookupPicker
          lookup={typeLookup}
          value={typeId ? [typeId] : []}
          onValueChange={([picked]) => set({ typeId: picked ?? null })}
          placeholder={t('no-fitting-type', 'No type fits under this unit')}
        />
      </Field>
      <Field id={ids.parent} label={t('parent', 'Sits under')}>
        <LookupPicker
          lookup={parents}
          value={draft.parentId ? [draft.parentId] : []}
          onValueChange={([parentId]) => set({ parentId: parentId ?? null })}
          placeholder={t('top-level', 'Top level')}
        />
      </Field>
      <PeopleFields draft={draft} set={set} />
      {kind === 'branch' && <ContactFields draft={draft} set={set} />}
      <Textarea
        aria-label={t('description-field', 'Description')}
        placeholder={t('description-field', 'Description')}
        value={draft.description ?? ''}
        onChange={(event) => set({ description: event.target.value || null })}
      />
      <Button className="w-full" disabled={!draft.name.trim() || !typeId || saving} onClick={save}>
        {unit ? t('save', 'Save') : t('add', 'Add')}
      </Button>
    </div>
  );
};

/** Adds a unit of `kind`, or edits `unit`; open while `open` holds. */
export const UnitDialog = ({
  kind,
  unit,
  units,
  types,
  open,
  onOpenChange,
  title,
  description,
}: {
  kind: UnitKind;
  unit: Unit | null;
  units: Unit[];
  types: UnitType[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <Dialog.Content>
      <Dialog.HeaderCombined title={title} description={description} />
      {open && (
        <UnitForm
          kind={kind}
          unit={unit}
          units={units}
          types={types}
          onDone={() => onOpenChange(false)}
        />
      )}
    </Dialog.Content>
  </Dialog>
);
