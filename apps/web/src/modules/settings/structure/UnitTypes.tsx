import type { UnitKind, UnitType } from '@erxes/core-contract';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { Badge, Button, Input, Label, LookupPicker, Switch, Textarea, useConfirm } from 'erxes-ui';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FormSheet } from '~/components/FormSheet';
import { useUnitMutations } from './useUnits';

type Draft = Pick<
  UnitType,
  'name' | 'code' | 'description' | 'color' | 'canBeRoot' | 'allowedParentTypeIds' | 'isActive'
>;

const draftOf = (type: UnitType | null): Draft => ({
  name: type?.name ?? '',
  code: type?.code ?? null,
  description: type?.description ?? null,
  color: type?.color ?? '#64748b',
  canBeRoot: type?.canBeRoot ?? true,
  allowedParentTypeIds: type?.allowedParentTypeIds ?? [],
  isActive: type?.isActive ?? true,
});

const SwitchRow = ({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) => {
  const id = useId();

  return (
    <div className="flex items-center justify-between gap-4">
      <Label htmlFor={id}>{label}</Label>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  );
};

/** The type's name, code and colour. */
const NameFields = ({ draft, set }: { draft: Draft; set: (changes: Partial<Draft>) => void }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const ids = { name: useId(), code: useId() };

  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor={ids.name}>{t('name', 'Name')}</Label>
        <Input
          id={ids.name}
          value={draft.name}
          maxLength={100}
          onChange={(event) => set({ name: event.target.value })}
        />
      </div>
      <div className="flex items-end gap-3">
        <div className="flex-1 space-y-1.5">
          <Label htmlFor={ids.code}>{t('code', 'Code')}</Label>
          <Input
            id={ids.code}
            value={draft.code ?? ''}
            maxLength={50}
            onChange={(event) => set({ code: event.target.value || null })}
          />
        </div>
        <label
          className="relative size-9 shrink-0 cursor-pointer overflow-hidden rounded-md border bg-(--type-color)"
          style={{ '--type-color': draft.color }}
          title={t('colour', 'Colour')}
        >
          <input
            type="color"
            value={draft.color}
            aria-label={t('colour', 'Colour')}
            onChange={(event) => set({ color: event.target.value })}
            className="absolute inset-0 cursor-pointer opacity-0"
          />
        </label>
      </div>
    </>
  );
};

/** The type's fields: name, code, colour, where it may sit, and whether it is in use. */
const TypeFields = ({
  draft,
  set,
  type,
  types,
}: {
  draft: Draft;
  set: (changes: Partial<Draft>) => void;
  type: UnitType | null;
  types: UnitType[];
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const parentsId = useId();

  const parents = {
    options: types
      .filter((other) => other.id !== type?.id)
      .map((other) => ({ value: other.id, label: other.name })),
    loading: false,
    error: null,
  };

  return (
    <>
      <NameFields draft={draft} set={set} />
      <SwitchRow
        label={t('can-be-root', 'Can be at the top')}
        checked={draft.canBeRoot}
        onChange={(canBeRoot) => set({ canBeRoot })}
      />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={parentsId}>{t('allowed-parents', 'Sits under')}</Label>
        <LookupPicker
          lookup={parents}
          multiple
          value={draft.allowedParentTypeIds}
          onValueChange={(allowedParentTypeIds) => set({ allowedParentTypeIds })}
          placeholder={t('any-type', 'Any type')}
        />
      </div>
      <SwitchRow
        label={t('active', 'Active')}
        checked={draft.isActive}
        onChange={(isActive) => set({ isActive })}
      />
      <Textarea
        aria-label={t('description-field', 'Description')}
        placeholder={t('description-field', 'Description')}
        rows={3}
        value={draft.description ?? ''}
        onChange={(event) => set({ description: event.target.value || null })}
      />
    </>
  );
};

/** Deletes a type no unit has, after asking. */
const DeleteType = ({ type, onDeleted }: { type: UnitType; onDeleted: () => void }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { confirm } = useConfirm();
  const { removeType } = useUnitMutations();

  return (
    <div className="border-t pt-4">
      <Button
        type="button"
        variant="outline"
        onClick={() =>
          void confirm({
            message: t('remove-type-confirm', 'Delete the {{name}} type?', { name: type.name }),
          }).then(() => removeType.mutate({ id: type.id }, { onSuccess: onDeleted }))
        }
      >
        <IconTrash />
        {t('remove-type-button', 'Delete type')}
      </Button>
    </div>
  );
};

/** Adds a type of `kind`, or edits `type`, in a side sheet; its rules apply from now on. */
const TypeSheet = ({
  kind,
  type,
  types,
  open,
  onOpenChange,
}: {
  kind: UnitKind;
  type: UnitType | null;
  types: UnitType[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { createType, updateType } = useUnitMutations();
  const [draft, setDraft] = useState(() => draftOf(type));
  const set = (changes: Partial<Draft>) => setDraft((current) => ({ ...current, ...changes }));
  const done = { onSuccess: () => onOpenChange(false) };

  const save = () => {
    const fields = { ...draft, name: draft.name.trim() };

    if (!fields.name) return;

    if (type) updateType.mutate({ id: type.id, ...fields }, done);
    else createType.mutate({ kind, ...fields }, done);
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={type ? t('edit-type-title', 'Edit type') : t('add-type', 'Add type')}
      description={t(
        'type-hint',
        'A kind of unit and where it may sit. Units added or moved follow its rules.',
      )}
      submitLabel={type ? t('save', 'Save') : t('add', 'Add')}
      submitting={createType.isPending || updateType.isPending}
      onSubmit={(event) => {
        event.preventDefault();
        save();
      }}
    >
      <TypeFields draft={draft} set={set} type={type} types={types} />
      {type && <DeleteType type={type} onDeleted={() => onOpenChange(false)} />}
    </FormSheet>
  );
};

/** A type's chip: its colour and name, muted when inactive. */
export const TypeBadge = ({ type }: { type: UnitType | undefined }) =>
  type ? (
    <Badge variant={type.isActive ? 'secondary' : 'muted'}>
      <span
        className="mr-1.5 size-2 rounded-full bg-(--type-color)"
        style={{ '--type-color': type.color }}
      />
      {type.name}
    </Badge>
  ) : null;

/**
 * The kinds of branch or department the organisation uses (head office, store; division, team)
 * and where each may sit. A unit picks one; the first active one is the default.
 */
export const UnitTypes = ({
  kind,
  types,
  canChange,
}: {
  kind: UnitKind;
  types: UnitType[];
  canChange: boolean;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  // A new key per opening starts the sheet from the type it opens.
  const [editing, setEditing] = useState<{ type: UnitType | null; key: number } | null>(null);
  const [open, setOpen] = useState(false);

  const edit = (type: UnitType | null) => {
    setEditing((current) => ({ type, key: (current?.key ?? 0) + 1 }));
    setOpen(true);
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="mr-1 text-xs font-medium text-muted-foreground">{t('types', 'Types')}</span>
      {types.map((type) => (
        <button
          key={type.id}
          type="button"
          disabled={!canChange}
          className="rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring enabled:hover:opacity-80"
          aria-label={t('edit-type', 'Edit {{name}}', { name: type.name })}
          onClick={() => edit(type)}
        >
          <TypeBadge type={type} />
        </button>
      ))}
      {canChange && (
        <Button variant="ghost" size="sm" onClick={() => edit(null)}>
          <IconPlus />
          {t('add-type', 'Add type')}
        </Button>
      )}
      {editing && (
        <TypeSheet
          key={editing.key}
          kind={kind}
          type={editing.type}
          types={types}
          open={open}
          onOpenChange={setOpen}
        />
      )}
    </div>
  );
};
