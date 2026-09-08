import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { IconGripVertical } from '@tabler/icons-react';
import { cn } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { TNodePath } from '../../types';

export const SegmentSortableNode = ({
  path,
  children,
}: {
  path: TNodePath;
  children: React.ReactNode;
}) => {
  const { t } = useTranslation('segment', { keyPrefix: 'detail' });
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: path });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(
        'flex items-start gap-1 group/sortable',
        isDragging && 'relative z-10 opacity-60',
      )}
    >
      <button
        type="button"
        title={t('move-condition')}
        className={cn(
          'mt-3 shrink-0 cursor-grab touch-none text-muted-foreground',
          'opacity-0 group-hover/sortable:opacity-100 transition-opacity',
          'focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm',
          isDragging && 'opacity-100 cursor-grabbing',
        )}
        {...attributes}
        {...listeners}
      >
        <IconGripVertical className="size-4" />
      </button>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
};
