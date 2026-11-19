import { orpc } from '@erxes/core-contract/client';
import { useMutation } from '@tanstack/react-query';
import { cn, Input } from 'erxes-ui';
import { type KeyboardEvent, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useWorkspace } from './context';
import { TypeIcon } from './TypeIcon';
import { allowedChildTypes, defaultChildType } from './unitTree';
import { useStructureHandlers } from './useStructureHandlers';

/**
 * A new unit typed where it will sit, in the tree or on the chart: only its name is asked. Enter
 * adds it and leaves the line ready for the next one, Escape leaves. It starts as the type most
 * units beside it have, shown by its icon, and its type changes in the unit's details. `stacked`
 * lays it out as the chart's card: icon and name, then the hint under them.
 */
export const DraftInput = ({ parentId, stacked }: { parentId: string; stacked?: boolean }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { index, types, typesById, closeDraft } = useWorkspace();
  const [name, setName] = useState('');
  const [error, setError] = useState<string>();
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => input.current?.focus({ preventScroll: true }), []);

  const parent = index.byId.get(parentId);

  const typeId = defaultChildType(
    index.children.get(parentId) ?? [],
    allowedChildTypes(types, parent),
    parent?.typeId ?? null,
  );

  const type = typeId ? typesById.get(typeId) : undefined;
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

  const hint = type
    ? t('draft-hint-typed', 'Enter adds it as {{type}} · Esc cancels', { type: type.name })
    : t('draft-hint', 'Enter to add · Esc to cancel');

  return (
    <div
      className={cn(
        'flex min-w-0 flex-1',
        stacked ? 'flex-col justify-between' : 'items-center gap-2',
      )}
    >
      <div className={cn('flex min-w-0 items-center gap-2', !stacked && 'max-w-sm flex-1')}>
        <TypeIcon type={type} size={stacked ? 'md' : 'sm'} />
        <Input
          ref={input}
          value={name}
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
        role={error ? 'alert' : undefined}
        className={cn(
          'truncate text-xs',
          error ? 'text-destructive-text' : 'text-muted-foreground',
        )}
      >
        {error ?? hint}
      </span>
    </div>
  );
};
