import { IconArmchair, IconChevronRight, IconUsers } from '@tabler/icons-react';
import { Badge, Button, cn, TextOverflowTooltip } from 'erxes-ui';
import { KeyboardEvent, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useStructureWorkspace } from '../../contexts/StructureWorkspaceContext';
import {
  IStructureTreeRow,
  TStructureTreeEntity,
} from '../../types/structureEntity';
import { isStructureEntityArchived } from '../../utils/structureEntityStatus';
import { StructureEntityTypeIcon } from '../StructureEntityTypeIcon';

export const STRUCTURE_LIST_INDENT = 20;

export const StructureListRow = ({
  entity,
  depth,
  hasChildren,
  expanded,
}: IStructureTreeRow<TStructureTreeEntity>) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { typesById, selectedId, select, toggle } = useStructureWorkspace();
  const ref = useRef<HTMLDivElement>(null);
  const selected = selectedId === entity._id;
  const archived = isStructureEntityArchived(entity);

  useEffect(() => {
    if (selected) {
      ref.current?.scrollIntoView({ block: 'nearest' });
    }
  }, [selected]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' && event.target === event.currentTarget) {
      select(entity._id);
    }
  };

  return (
    <div
      ref={ref}
      role="treeitem"
      tabIndex={0}
      aria-level={depth + 1}
      aria-selected={selected}
      aria-expanded={hasChildren ? expanded : undefined}
      style={{ paddingLeft: depth * STRUCTURE_LIST_INDENT + 4 }}
      className={cn(
        'flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-md pr-3 text-sm outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring',
        selected && 'bg-primary/10 text-primary hover:bg-primary/10',
        archived && 'text-muted-foreground',
      )}
      onClick={() => select(entity._id)}
      onKeyDown={handleKeyDown}
    >
      {hasChildren ? (
        <Button
          variant="ghost"
          size="icon"
          className="size-6 shrink-0"
          aria-label={t(expanded ? 'collapse' : 'expand')}
          onClick={(event) => {
            event.stopPropagation();
            toggle(entity._id, expanded);
          }}
        >
          <IconChevronRight
            className={cn('transition-transform', expanded && 'rotate-90')}
          />
        </Button>
      ) : (
        <span className="size-6 shrink-0" />
      )}
      <StructureEntityTypeIcon
        icon={typesById.get(entity.typeId)?.icon}
        className={cn(
          'size-4 shrink-0',
          selected ? 'text-primary' : 'text-muted-foreground',
        )}
      />
      <TextOverflowTooltip
        value={entity.title}
        className={cn('min-w-0 flex-1', archived && 'line-through')}
      />
      {archived && (
        <Badge variant="secondary" className="shrink-0 font-normal">
          {t('archived')}
        </Badge>
      )}
      <span
        className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground"
        title={t('headcount')}
      >
        <IconUsers className="size-3.5" />
        {entity.memberCount ?? 0}
      </span>
      {(entity.seatCount ?? 0) > 0 && (
        <span
          className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground"
          title={t('seat-count', { count: entity.seatCount })}
        >
          <IconArmchair className="size-3.5" />
          {entity.seatCount}
        </span>
      )}
    </div>
  );
};
