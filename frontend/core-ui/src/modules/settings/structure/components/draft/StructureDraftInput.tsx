import { cn, Input } from 'erxes-ui';
import { KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStructureWorkspace } from '../../contexts/StructureWorkspaceContext';
import { useStructureDraft } from '../../hooks/useStructureDraft';
import {
  getAllowedChildTypes,
  getStructureDefaultChildTypeId,
} from '../../utils/structureTree';
import { StructureDraftTypePicker } from './StructureDraftTypePicker';
import { StructureNewTypeDialog } from './StructureNewTypeDialog';

export const StructureDraftInput = ({
  parentId,
  className,
}: {
  parentId: string;
  className?: string;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { entitiesById, childrenById, types } = useStructureWorkspace();
  const { closeDraft, createChild, busy } = useStructureDraft();
  const inputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const [pickedTypeId, setPickedTypeId] = useState<string>();
  const [error, setError] = useState<string>();
  const [newTypeOpen, setNewTypeOpen] = useState(false);
  const parentTypeId = entitiesById.get(parentId)?.typeId;
  const allowedTypes = useMemo(
    () => getAllowedChildTypes(types, parentTypeId),
    [types, parentTypeId],
  );
  const typeId = allowedTypes.some(({ _id }) => _id === pickedTypeId)
    ? pickedTypeId
    : getStructureDefaultChildTypeId(
        childrenById.get(parentId) ?? [],
        allowedTypes,
      );

  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  const submit = async (nextTypeId = typeId) => {
    const value = title.trim();

    if (!value) {
      setError(t('title-required'));
      return;
    }

    if (!nextTypeId) {
      setError(t('type-required'));
      return;
    }

    if (await createChild({ parentId, typeId: nextTypeId, title: value })) {
      closeDraft();
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      void submit();
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      closeDraft();
    }
  };

  const pickType = (nextTypeId: string) => {
    setPickedTypeId(nextTypeId);
    setError(undefined);
    inputRef.current?.focus({ preventScroll: true });
  };

  const handleTypeCreated = (nextTypeId: string) => {
    pickType(nextTypeId);

    if (title.trim()) {
      void submit(nextTypeId);
    }
  };

  return (
    <div
      className={cn(
        'nodrag nopan flex size-full flex-col justify-center gap-1 rounded-lg border border-dashed border-primary bg-background px-2.5 py-2 shadow-sm',
        className,
      )}
    >
      <div className="flex items-center gap-1.5">
        <StructureDraftTypePicker
          types={allowedTypes}
          value={typeId}
          disabled={busy}
          onChange={pickType}
          onNewType={() => setNewTypeOpen(true)}
        />
        <Input
          ref={inputRef}
          value={title}
          disabled={busy}
          placeholder={t('child-title-placeholder')}
          aria-label={t('title')}
          aria-invalid={!!error}
          className="h-7 min-w-0 flex-1"
          onChange={(event) => {
            setTitle(event.currentTarget.value);
            setError(undefined);
          }}
          onKeyDown={handleKeyDown}
        />
      </div>
      <span
        className={cn(
          'truncate text-xs',
          error ? 'text-destructive' : 'text-muted-foreground',
        )}
      >
        {error ?? t('draft-hint')}
      </span>
      <StructureNewTypeDialog
        open={newTypeOpen}
        onOpenChange={setNewTypeOpen}
        onCreated={handleTypeCreated}
      />
    </div>
  );
};
