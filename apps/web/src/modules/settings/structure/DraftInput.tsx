import type { UnitType } from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import { IconChevronDown } from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import { Button, Input, Popover } from 'erxes-ui';
import { type KeyboardEvent, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useWorkspace } from './context';
import { TypeIcon } from './TypeIcon';
import { TypeOptions } from './TypeOptions';
import { allowedChildTypes, defaultChildType } from './unitTree';
import { useStructureHandlers } from './useStructureHandlers';

/** The new unit's type, from the types allowed under its parent. */
const TypePicker = ({
  types,
  value,
  disabled,
  onChange,
}: {
  types: UnitType[];
  value: string | undefined;
  disabled: boolean;
  onChange: (typeId: string) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const [open, setOpen] = useState(false);
  const selected = types.find((type) => type.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        render={
          <Button
            variant="secondary"
            size="xs"
            disabled={disabled}
            className="max-w-28 shrink-0"
            aria-label={t('type-of-new-unit', 'Type of the new unit')}
          />
        }
      >
        <TypeIcon type={selected} size="sm" />
        <span className="truncate">{selected?.name ?? t('type', 'Type')}</span>
        <IconChevronDown className="size-3 shrink-0" />
      </Popover.Trigger>
      <Popover.Content variant="flush" className="min-w-60" align="start">
        <TypeOptions
          types={types}
          onPick={(type) => {
            onChange(type.id);
            setOpen(false);
          }}
        />
      </Popover.Content>
    </Popover>
  );
};

/**
 * The "new unit" card in the chart or the list: pick a type, type a name, Enter adds it, Escape
 * leaves. Only types allowed under the parent are offered.
 */
export const DraftInput = ({ parentId }: { parentId: string }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { index, types, closeDraft, select } = useWorkspace();
  const [name, setName] = useState('');
  const [picked, setPicked] = useState<string>();
  const [error, setError] = useState<string>();
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => input.current?.focus({ preventScroll: true }), []);

  const parent = index.byId.get(parentId);
  const allowed = allowedChildTypes(types, parent);

  const typeId = allowed.some((type) => type.id === picked)
    ? picked
    : defaultChildType(index.children.get(parentId) ?? [], allowed, parent?.typeId ?? null);

  const create = useMutation(
    orpc.units.create.mutationOptions(
      useStructureHandlers((unit) => {
        closeDraft();
        select(unit.id, unit);
      }),
    ),
  );

  const submit = () => {
    const value = name.trim();

    if (!value) return setError(t('name-the-unit', 'Name the unit'));

    if (!typeId) return setError(t('no-type-fits', 'No unit type fits here.'));

    create.mutate({ name: value, typeId, parentId });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      submit();
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      closeDraft();
    }
  };

  return (
    <div className="flex size-full flex-col justify-center gap-1 rounded-lg border border-dashed border-primary bg-background px-2.5 py-2 shadow-sm">
      <div className="flex items-center gap-1.5">
        <TypePicker
          types={allowed}
          value={typeId}
          disabled={create.isPending}
          onChange={(next) => {
            setPicked(next);
            setError(undefined);
          }}
        />
        <Input
          ref={input}
          value={name}
          disabled={create.isPending}
          maxLength={200}
          placeholder={t('unit-name', 'Unit name')}
          aria-label={t('new-unit-name', 'New unit name')}
          aria-invalid={Boolean(error)}
          className="h-7 min-w-0 flex-1"
          onChange={(event) => {
            setName(event.currentTarget.value);
            setError(undefined);
          }}
          onKeyDown={onKeyDown}
        />
      </div>
      <span
        className={
          error
            ? 'truncate text-xs text-destructive-text'
            : 'truncate text-xs text-muted-foreground'
        }
      >
        {error ?? t('draft-hint', 'Enter to add · Esc to cancel')}
      </span>
    </div>
  );
};
