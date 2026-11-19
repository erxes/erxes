import type { UnitDetail } from '@erxes/core-contract';
import { memberQueries, orpc } from '@erxes/core-contract/client';
import {
  IconAddressBook,
  IconAlignLeft,
  IconCategory,
  IconHash,
  IconMail,
  IconPhone,
  IconToggleLeft,
  IconUserStar,
} from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import {
  PanelField,
  PanelSection,
  PopoverScoped,
  RecordTableInlineCell,
  SelectMember,
  Switch,
  TextField,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useWorkspace } from './context';
import { TypeIcon } from './TypeIcon';
import { TypeOptions } from './TypeOptions';
import { allowedChildTypes } from './unitTree';
import { useStructureHandlers } from './useStructureHandlers';

type Patch = Omit<Parameters<ReturnType<typeof useSaveUnit>['mutate']>[0], 'id'>;

export const useSaveUnit = () =>
  useMutation(orpc.units.update.mutationOptions(useStructureHandlers()));

/** The unit's type, from those allowed under its parent; its own stays listed. */
const TypeRow = ({
  unit,
  disabled,
  update,
}: {
  unit: UnitDetail;
  disabled: boolean;
  update: (patch: Patch) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { index, types, typesById } = useWorkspace();
  const [open, setOpen] = useState(false);
  const parent = unit.parentId ? index.byId.get(unit.parentId) : undefined;
  const own = unit.typeId ? typesById.get(unit.typeId) : undefined;
  const allowed = allowedChildTypes(types, parent);
  const options = own && !allowed.includes(own) ? [own, ...allowed] : allowed;

  return (
    <PanelField icon={IconCategory} label={t('type', 'Type')}>
      <PopoverScoped scope={`structure-unit.${unit.id}.type`} open={open} onOpenChange={setOpen}>
        <RecordTableInlineCell.Trigger variant="field" disabled={disabled}>
          <TypeIcon type={own} size="sm" />
          <span className="truncate">{own?.name}</span>
        </RecordTableInlineCell.Trigger>
        <RecordTableInlineCell.Content>
          <TypeOptions
            types={options}
            onPick={(type) => {
              if (type.id !== unit.typeId) update({ typeId: type.id });
              setOpen(false);
            }}
          />
        </RecordTableInlineCell.Content>
      </PopoverScoped>
    </PanelField>
  );
};

/** The unit's short code, edited in place. */
const CodeRow = ({
  unit,
  disabled,
  update,
}: {
  unit: UnitDetail;
  disabled: boolean;
  update: (patch: Patch) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });

  return (
    <PanelField icon={IconHash} label={t('code', 'Code')}>
      <TextField
        variant="field"
        scope={`structure-unit.${unit.id}.code`}
        value={unit.code ?? ''}
        placeholder={t('code', 'Code')}
        disabled={disabled}
        onSave={(next) => {
          const trimmed = next.trim();

          if (trimmed !== (unit.code ?? '')) update({ code: trimmed || null });
        }}
      />
    </PanelField>
  );
};

/** How to reach the unit and what it does, each edited in place. */
const TextRows = ({
  unit,
  disabled,
  update,
}: {
  unit: UnitDetail;
  disabled: boolean;
  update: (patch: Patch) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });

  const rows = [
    { name: 'email', icon: IconMail, label: t('email', 'Email'), value: unit.email },
    { name: 'phone', icon: IconPhone, label: t('phone', 'Phone'), value: unit.phone },
    { name: 'address', icon: IconAddressBook, label: t('address', 'Address'), value: unit.address },
    {
      name: 'description',
      icon: IconAlignLeft,
      label: t('about', 'About'),
      value: unit.description,
    },
  ] as const;

  return rows.map((row) => (
    <PanelField key={row.name} icon={row.icon} label={row.label}>
      <TextField
        variant="field"
        scope={`structure-unit.${unit.id}.${row.name}`}
        value={row.value ?? ''}
        placeholder={row.label}
        disabled={disabled}
        onSave={(next) => {
          const trimmed = next.trim();

          if (trimmed !== (row.value ?? '')) update({ [row.name]: trimmed || null });
        }}
      />
    </PanelField>
  ));
};

/**
 * The unit's fields, edited in place by members who manage the structure: what it is, then how
 * to reach it. The organisation's own unit has no type and is always active.
 */
export const UnitFields = ({ unit }: { unit: UnitDetail }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { canManage, canSeeTeam } = useWorkspace();
  const save = useSaveUnit();
  const disabled = !canManage;
  const isRoot = !unit.parentId;
  const update = (patch: Patch) => save.mutate({ id: unit.id, ...patch });

  return (
    <>
      <PanelSection title={t('unit', 'Unit')}>
        {canSeeTeam && (
          <PanelField icon={IconUserStar} label={t('supervisor', 'Supervisor')}>
            <SelectMember.InlineCell
              variant="field"
              scope={`structure-unit.${unit.id}.supervisor`}
              value={unit.supervisorId}
              members={memberQueries}
              noneLabel={t('no-supervisor', 'No supervisor')}
              placeholder={t('no-supervisor', 'No supervisor')}
              onValueChange={(supervisorId) => {
                if (canManage) update({ supervisorId });
              }}
            />
          </PanelField>
        )}
        {!isRoot && <TypeRow unit={unit} disabled={disabled} update={update} />}
        <CodeRow unit={unit} disabled={disabled} update={update} />
        {!isRoot && (
          <PanelField icon={IconToggleLeft} label={t('active', 'Active')} cell={false}>
            <span className="flex h-7 items-center px-2">
              <Switch
                checked={unit.isActive}
                disabled={disabled || save.isPending}
                aria-label={t('unit-active', 'Unit is active')}
                onCheckedChange={(isActive) => update({ isActive })}
              />
            </span>
          </PanelField>
        )}
      </PanelSection>
      <PanelSection title={t('contact', 'Contact')}>
        <TextRows unit={unit} disabled={disabled} update={update} />
      </PanelSection>
    </>
  );
};
