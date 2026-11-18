import type { UnitType } from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import { useMutation } from '@tanstack/react-query';
import { ColorPicker, IconPicker, Input, Label, LookupPicker, Switch, Textarea } from 'erxes-ui';
import { type ReactNode, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FormSheet } from '~/components/FormSheet';
import { useStructureHandlers } from './useStructureHandlers';

type Draft = Pick<
  UnitType,
  | 'name'
  | 'code'
  | 'description'
  | 'color'
  | 'icon'
  | 'canBeRoot'
  | 'allowedParentTypeIds'
  | 'isActive'
>;

const draftOf = (type: UnitType | null): Draft => ({
  name: type?.name ?? '',
  code: type?.code ?? null,
  description: type?.description ?? null,
  color: type?.color ?? '#4f46e5',
  icon: type?.icon ?? null,
  canBeRoot: type?.canBeRoot ?? true,
  allowedParentTypeIds: type?.allowedParentTypeIds ?? [],
  isActive: type?.isActive ?? true,
});

const Field = ({ id, label, children }: { id: string; label: string; children: ReactNode }) => (
  <div className="flex min-w-0 flex-col gap-1.5">
    <Label htmlFor={id}>{label}</Label>
    {children}
  </div>
);

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

/** Name, code, colour and icon. */
const LookFields = ({ draft, set }: { draft: Draft; set: (changes: Partial<Draft>) => void }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const ids = { name: useId(), code: useId(), color: useId(), icon: useId() };

  return (
    <>
      <Field id={ids.name} label={t('name', 'Name')}>
        <Input
          id={ids.name}
          value={draft.name}
          required
          maxLength={100}
          placeholder={t('type-name-example', 'Such as Region or Team')}
          onChange={(event) => set({ name: event.target.value })}
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field id={ids.code} label={t('code', 'Code')}>
          <Input
            id={ids.code}
            value={draft.code ?? ''}
            maxLength={50}
            onChange={(event) => set({ code: event.target.value || null })}
          />
        </Field>
        <div className="flex gap-3">
          <Field id={ids.color} label={t('colour', 'Colour')}>
            <ColorPicker
              id={ids.color}
              className="h-9 w-16"
              value={draft.color}
              onValueChange={(color) => set({ color })}
            />
          </Field>
          <Field id={ids.icon} label={t('icon', 'Icon')}>
            <IconPicker
              id={ids.icon}
              value={draft.icon ?? undefined}
              onValueChange={(icon) => set({ icon })}
            />
          </Field>
        </div>
      </div>
    </>
  );
};

/** Where units of the type may sit, and whether it is given to new units. */
const PlaceFields = ({
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
      .map((other) => ({
        value: other.id,
        label: other.pluginTitle ? `${other.name} (${other.pluginTitle})` : other.name,
      })),
    loading: false,
    error: null,
  };

  return (
    <>
      <SwitchRow
        label={t('can-be-root', 'Can sit right under the organisation')}
        checked={draft.canBeRoot}
        onChange={(canBeRoot) => set({ canBeRoot })}
      />
      <Field id={parentsId} label={t('allowed-parents', 'Can sit under')}>
        <LookupPicker
          lookup={parents}
          multiple
          value={draft.allowedParentTypeIds}
          onValueChange={(allowedParentTypeIds) => set({ allowedParentTypeIds })}
          placeholder={t('any-type', 'Any unit type')}
        />
      </Field>
      <SwitchRow
        label={t('active', 'Active')}
        checked={draft.isActive}
        onChange={(isActive) => set({ isActive })}
      />
      <Textarea
        aria-label={t('about', 'About')}
        placeholder={t('type-about', 'What units of this type are for')}
        rows={3}
        value={draft.description ?? ''}
        onChange={(event) => set({ description: event.target.value || null })}
      />
    </>
  );
};

/** Adds a unit type, or edits one of the organisation's own; its rules apply from now on. */
export const UnitTypeForm = ({
  type,
  types,
  order,
  open,
  onOpenChange,
}: {
  type: UnitType | null;
  types: UnitType[];
  /** Where a new type goes in the list. */
  order: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const [draft, setDraft] = useState(() => draftOf(type));
  const set = (changes: Partial<Draft>) => setDraft((current) => ({ ...current, ...changes }));
  const handlers = useStructureHandlers(() => onOpenChange(false));
  const create = useMutation(orpc.unitTypes.create.mutationOptions(handlers));
  const update = useMutation(orpc.unitTypes.update.mutationOptions(handlers));

  const save = () => {
    const fields = { ...draft, name: draft.name.trim() };

    if (!fields.name) return;

    if (type) update.mutate({ id: type.id, ...fields });
    else create.mutate({ ...fields, sortOrder: order });
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={
        type ? t('edit-type', 'Edit {{name}}', { name: type.name }) : t('add-type', 'Add type')
      }
      description={t(
        'type-hint',
        'A kind of unit and where it may sit. Units added or moved from now on follow its rules.',
      )}
      submitLabel={type ? t('save', 'Save') : t('add', 'Add')}
      submitting={create.isPending || update.isPending}
      onSubmit={(event) => {
        event.preventDefault();
        save();
      }}
    >
      <LookFields draft={draft} set={set} />
      <PlaceFields draft={draft} set={set} type={type} types={types} />
    </FormSheet>
  );
};
