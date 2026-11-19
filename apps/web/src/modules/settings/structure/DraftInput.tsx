import type { UnitType } from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import { IconChevronDown } from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import { Button, cn, InputGroup, Popover } from 'erxes-ui';
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
  onChange,
}: {
  types: UnitType[];
  value: string | undefined;
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
            variant="ghost"
            size="xs"
            className="max-w-32 shrink-0"
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
 * A new unit typed where it will sit, in the tree or on the chart: pick a type, type a name,
 * Enter adds it and leaves the line ready for the next one, Escape leaves. Only types allowed
 * under the parent are offered. `stacked` puts the hint under the box, for the chart's card.
 */
export const DraftInput = ({ parentId, stacked }: { parentId: string; stacked?: boolean }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { index, types, closeDraft } = useWorkspace();
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

  const create = useMutation(orpc.units.create.mutationOptions(useStructureHandlers()));

  const submit = () => {
    const value = name.trim();

    if (create.isPending) return;

    if (!value) return setError(t('name-the-unit', 'Name the unit'));

    if (!typeId) return setError(t('no-type-fits', 'No unit type fits here.'));

    create.mutate({ name: value, typeId, parentId }, { onSuccess: () => setName('') });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
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
    <div className={cn('flex min-w-0 flex-1 gap-2', stacked ? 'flex-col' : 'items-center')}>
      <InputGroup className={stacked ? undefined : 'max-w-md'}>
        <InputGroup.Addon>
          <TypePicker
            types={allowed}
            value={typeId}
            onChange={(next) => {
              setPicked(next);
              setError(undefined);
              input.current?.focus();
            }}
          />
        </InputGroup.Addon>
        <InputGroup.Input
          ref={input}
          value={name}
          maxLength={200}
          placeholder={t('unit-name', 'Unit name')}
          aria-label={t('new-unit-name', 'New unit name')}
          aria-invalid={Boolean(error)}
          onChange={(event) => {
            setName(event.currentTarget.value);
            setError(undefined);
          }}
          onKeyDown={onKeyDown}
        />
      </InputGroup>
      <span
        role={error ? 'alert' : undefined}
        className={cn(
          'truncate text-xs',
          error ? 'text-destructive-text' : 'text-muted-foreground',
        )}
      >
        {error ?? t('draft-hint', 'Enter to add · Esc to cancel')}
      </span>
    </div>
  );
};
