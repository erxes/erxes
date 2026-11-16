import type { Unit, UnitKind } from '@erxes/core-contract';
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
import { treeRows, useUnitMutations } from './useUnits';

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
> & { memberIds: string[] };

const draftOf = (unit: Unit | null): Draft => ({
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

/** Mounted while the dialog is open, so closing it drops what was typed. */
const UnitForm = ({
  kind,
  unit,
  units,
  onDone,
}: {
  kind: UnitKind;
  unit: Unit | null;
  units: Unit[];
  onDone: () => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { create, update } = useUnitMutations();
  const [draft, setDraft] = useState(() => draftOf(unit));
  const set = (changes: Partial<Draft>) => setDraft((current) => ({ ...current, ...changes }));
  const memberOptions = useMemberOptions(memberQueries, true, draft.memberIds);
  const parents = { options: parentOptions(units, unit), loading: false, error: null };
  const ids = { name: useId(), parent: useId(), supervisor: useId(), members: useId() };
  const saving = create.isPending || update.isPending;

  const save = () => {
    const fields = { ...draft, name: draft.name.trim() };
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
      <Field id={ids.parent} label={t('parent', 'Sits under')}>
        <LookupPicker
          lookup={parents}
          value={draft.parentId ? [draft.parentId] : []}
          onValueChange={([parentId]) => set({ parentId: parentId ?? null })}
          placeholder={t('top-level', 'Top level')}
        />
      </Field>
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
      {kind === 'branch' && <ContactFields draft={draft} set={set} />}
      <Textarea
        aria-label={t('description-field', 'Description')}
        placeholder={t('description-field', 'Description')}
        value={draft.description ?? ''}
        onChange={(event) => set({ description: event.target.value || null })}
      />
      <Button className="w-full" disabled={!draft.name.trim() || saving} onClick={save}>
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
  open,
  onOpenChange,
  title,
  description,
}: {
  kind: UnitKind;
  unit: Unit | null;
  units: Unit[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <Dialog.Content>
      <Dialog.HeaderCombined title={title} description={description} />
      {open && (
        <UnitForm kind={kind} unit={unit} units={units} onDone={() => onOpenChange(false)} />
      )}
    </Dialog.Content>
  </Dialog>
);
