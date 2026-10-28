import {
  IconArmchair,
  IconChevronDown,
  IconChevronUp,
  IconPlus,
  IconUsers,
} from '@tabler/icons-react';
import { Handle, NodeProps, Position } from '@xyflow/react';
import { Badge, Button, cn, Skeleton, TextOverflowTooltip } from 'erxes-ui';
import { KeyboardEvent, MouseEvent, PointerEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { getStructureManager, useStructureSeats } from '@/structure-access';
import { useStructureWorkspace } from '../../contexts/StructureWorkspaceContext';
import { useStructureCardDnd } from '../../hooks/useStructureCardDnd';
import { useStructureTypeDialogs } from '../../hooks/useStructureTypeDialogs';
import { TStructureCanvasCardNode } from '../../types/structureCanvas';
import { TStructureTreeEntity } from '../../types/structureEntity';
import { IStructureDragPerson } from '../../utils/structureDrop';
import { isStructureEntityArchived } from '../../utils/structureEntityStatus';
import { StructurePersonChip } from '../dnd/StructurePersonChip';
import { StructureEntityTypeIcon } from '../StructureEntityTypeIcon';
import { StructureTypePill } from '../type-change/StructureTypePill';

const HIDDEN_HANDLE = 'opacity-0';

const stopPointer = (event: PointerEvent<HTMLButtonElement>) =>
  event.stopPropagation();

const stop = (action: () => void) => (event: MouseEvent<HTMLButtonElement>) => {
  event.stopPropagation();
  action();
};

const StructureCanvasCardManager = ({
  entity,
  disabled,
}: {
  entity: TStructureTreeEntity;
  disabled: boolean;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { seats, loading, error } = useStructureSeats({
    entityId: entity._id,
    skip: !entity.seatCount,
    fetchPolicy: 'cache-first',
  });
  const manager = getStructureManager(seats);

  if (loading) {
    return <Skeleton className="h-4 w-24" />;
  }

  if (error) {
    return (
      <span className="truncate text-destructive" title={error.message}>
        {t('manager-load-failed')}
      </span>
    );
  }

  if (!manager) {
    return <span className="truncate">{t('no-manager')}</span>;
  }

  const person: IStructureDragPerson = {
    userId: manager._id,
    name: manager.details?.fullName || manager.email || manager._id,
    avatar: manager.details?.avatar,
  };

  return (
    <StructurePersonChip
      dragId={`person:card:${entity._id}:${manager._id}`}
      person={person}
      disabled={disabled}
      className="-ml-0.5"
    />
  );
};

export const StructureCanvasCard = ({
  data,
}: NodeProps<TStructureCanvasCardNode>) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { entity, expanded, childCount, hiddenLabel } = data;
  const { typesById, selectedId, select, toggle, startDraft, canManage } =
    useStructureWorkspace();
  const { openTypeSettings } = useStructureTypeDialogs();
  const { setNodeRef, dragProps, isDragging, isDropTarget } =
    useStructureCardDnd(entity);
  const type = typesById.get(entity.typeId);
  const archived = isStructureEntityArchived(entity);
  const selected = selectedId === entity._id;

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' && event.target === event.currentTarget) {
      select(entity._id);
    }
  };

  return (
    <div
      ref={setNodeRef}
      role="button"
      tabIndex={0}
      {...dragProps}
      aria-label={entity.title}
      aria-pressed={selected}
      className={cn(
        'nodrag nopan group relative flex size-full cursor-pointer flex-col justify-between rounded-lg border bg-background px-3 py-2.5 shadow-xs outline-none transition-colors hover:border-primary focus-visible:ring-2 focus-visible:ring-ring',
        selected && 'border-primary ring-2 ring-primary/30',
        archived && 'border-dashed bg-muted text-muted-foreground',
        isDropTarget && 'border-primary bg-primary/5 ring-2 ring-primary',
        isDragging && 'opacity-50',
      )}
      onClick={() => select(entity._id)}
      onKeyDown={handleKeyDown}
    >
      <Handle
        id="top"
        type="target"
        position={Position.Top}
        isConnectable={false}
        className={HIDDEN_HANDLE}
      />
      <Handle
        id="left"
        type="target"
        position={Position.Left}
        isConnectable={false}
        className={HIDDEN_HANDLE}
      />
      <div className="flex min-w-0 items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="size-7 shrink-0 bg-primary/10 text-primary hover:bg-primary/20"
          aria-label={t('type-settings-of', { name: type?.name ?? '' })}
          title={type?.name}
          onPointerDown={stopPointer}
          onClick={stop(() => openTypeSettings(entity.typeId))}
        >
          <StructureEntityTypeIcon icon={type?.icon} className="size-4" />
        </Button>
        <TextOverflowTooltip
          value={entity.title}
          className="min-w-0 text-sm font-medium"
        />
        {archived && (
          <Badge variant="secondary" className="ml-auto shrink-0 font-normal">
            {t('archived')}
          </Badge>
        )}
        <div className="ml-auto flex shrink-0 items-center gap-1">
          {childCount > 0 && (
            <Button
              variant="secondary"
              size="sm"
              className="h-6 gap-1 rounded-full px-2 text-xs"
              aria-label={expanded ? t('collapse') : t('expand')}
              title={expanded ? t('collapse') : t('expand')}
              onPointerDown={stopPointer}
              onClick={stop(() => toggle(entity._id, expanded))}
            >
              {expanded ? (
                <IconChevronUp className="size-3" />
              ) : (
                <>
                  {hiddenLabel}
                  <IconChevronDown className="size-3" />
                </>
              )}
            </Button>
          )}
          {canManage && !archived && (
            <Button
              variant="secondary"
              size="icon"
              className="size-6 rounded-full"
              aria-label={t('add-child')}
              title={t('add-child')}
              onPointerDown={stopPointer}
              onClick={stop(() => startDraft(entity._id))}
            >
              <IconPlus className="size-3" />
            </Button>
          )}
        </div>
      </div>
      <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
        <div className="min-w-0 flex-1">
          <StructureCanvasCardManager
            entity={entity}
            disabled={!canManage || archived}
          />
        </div>
        <StructureTypePill entity={entity} />
        <span
          className="flex shrink-0 items-center gap-1"
          title={t('headcount')}
        >
          <IconUsers className="size-3.5" />
          {entity.memberCount ?? 0}
        </span>
        {(entity.seatCount ?? 0) > 0 && (
          <span
            className="flex shrink-0 items-center gap-1"
            title={t('seat-count', { count: entity.seatCount })}
          >
            <IconArmchair className="size-3.5" />
            {entity.seatCount}
          </span>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={false}
        className={HIDDEN_HANDLE}
      />
    </div>
  );
};
