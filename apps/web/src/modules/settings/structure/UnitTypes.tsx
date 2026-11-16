import type { UnitKind, UnitType } from '@erxes/core-contract';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import {
  Badge,
  Button,
  Dialog,
  Input,
  Label,
  LookupPicker,
  Switch,
  Textarea,
  useConfirm,
} from 'erxes-ui';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
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

/** Mounted while the dialog is open, so closing it drops what was typed. */
const TypeForm = ({
  kind,
  type,
  types,
  onDone,
}: {
  kind: UnitKind;
  type: UnitType | null;
  types: UnitType[];
  onDone: () => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { createType, updateType } = useUnitMutations();
  const [draft, setDraft] = useState(() => draftOf(type));
  const set = (changes: Partial<Draft>) => setDraft((current) => ({ ...current, ...changes }));
  const parentsId = useId();

  const parents = {
    options: types
      .filter((other) => other.id !== type?.id)
      .map((other) => ({ value: other.id, label: other.name })),
    loading: false,
    error: null,
  };

  const save = () => {
    const fields = { ...draft, name: draft.name.trim() };
    const done = { onSuccess: onDone };

    if (type) updateType.mutate({ id: type.id, ...fields }, done);
    else createType.mutate({ kind, ...fields }, done);
  };

  return (
    <div className="space-y-4">
      <NameFields draft={draft} set={set} />
      <SwitchRow
        label={t('can-be-root', 'Can be at the top')}
        checked={draft.canBeRoot}
        onChange={(canBeRoot) => set({ canBeRoot })}
      />
      <div className="space-y-1.5">
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
        value={draft.description ?? ''}
        onChange={(event) => set({ description: event.target.value || null })}
      />
      <Button
        className="w-full"
        disabled={!draft.name.trim() || createType.isPending || updateType.isPending}
        onClick={save}
      >
        {type ? t('save', 'Save') : t('add', 'Add')}
      </Button>
    </div>
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
  const { confirm } = useConfirm();
  const { removeType } = useUnitMutations();
  const [editing, setEditing] = useState<UnitType | 'new' | null>(null);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted-foreground">{t('types', 'Types')}</span>
      {types.map((type) => (
        <span key={type.id} className="inline-flex items-center">
          <button
            type="button"
            disabled={!canChange}
            aria-label={t('edit-type', 'Edit {{name}}', { name: type.name })}
            onClick={() => setEditing(type)}
          >
            <TypeBadge type={type} />
          </button>
          {canChange && (
            <Button
              variant="ghost"
              size="icon"
              className="size-6"
              aria-label={t('remove-type', 'Delete {{name}}', { name: type.name })}
              onClick={() =>
                void confirm({
                  message: t('remove-type-confirm', 'Delete the {{name}} type?', {
                    name: type.name,
                  }),
                }).then(() => removeType.mutate({ id: type.id }))
              }
            >
              <IconTrash />
            </Button>
          )}
        </span>
      ))}
      {canChange && (
        <Button variant="ghost" size="sm" onClick={() => setEditing('new')}>
          <IconPlus />
          {t('add-type', 'Add type')}
        </Button>
      )}
      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <Dialog.Content>
          <Dialog.HeaderCombined
            title={
              editing === 'new' ? t('add-type', 'Add type') : t('edit-type-title', 'Edit type')
            }
            description={t(
              'type-hint',
              'A kind of unit and where it may sit. Units added or moved follow its rules.',
            )}
          />
          {editing !== null && (
            <TypeForm
              kind={kind}
              type={editing === 'new' ? null : editing}
              types={types}
              onDone={() => setEditing(null)}
            />
          )}
        </Dialog.Content>
      </Dialog>
    </div>
  );
};
