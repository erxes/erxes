import { useDraggable, useDroppable } from '@dnd-kit/core';
import { type ReactNode, useLayoutEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';
import { BoardCardShell } from './BoardCardShell';
import { useBoard, useBoardColumnId } from './boardContext';

/**
 * A card on the board, `title` naming it to screen readers: drag it anywhere on it, click it
 * or press Enter to open it, or pick it up with Space and move it with the arrow keys.
 * `footer` sits under the card's own button, for links or buttons of its own.
 */
export const BoardCard = ({
  id,
  title,
  onOpen,
  children,
  footer,
}: {
  id: string;
  title: string;
  onOpen: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) => {
  const { t } = useTranslation('views', { keyPrefix: 'board' });
  const { ordered, cards, target } = useBoard();
  const columnId = useBoardColumnId();
  const button = useRef<HTMLButtonElement | null>(null);

  const { attributes, listeners, setNodeRef, setActivatorNodeRef, isDragging } = useDraggable({
    id,
    attributes: { roleDescription: t('draggable', 'movable card') },
  });

  const { setNodeRef: setDropRef } = useDroppable({ id, disabled: !ordered });
  const above = target?.beforeId === id;
  const extra = footer && <div className="relative">{footer}</div>;

  useLayoutEffect(() =>
    cards.add(id, {
      columnId,
      title,
      preview: (
        <>
          <div className="flex flex-col gap-2">{children}</div>
          {extra}
        </>
      ),
    }),
  );

  useLayoutEffect(() => {
    if (cards.takesFocus(id, button.current)) button.current?.focus();
  });

  return (
    <div ref={setDropRef} className="relative shrink-0">
      {above && <span className="absolute -top-1.5 inset-x-1 h-0.5 rounded bg-primary" />}
      <BoardCardShell
        ref={setNodeRef}
        {...listeners}
        className={cn(
          'cursor-grab transition hover:border-foreground/15 hover:shadow-sm has-[>button:focus-visible]:ring-2 has-[>button:focus-visible]:ring-ring active:cursor-grabbing',
          isDragging && 'border-dashed opacity-40 shadow-none',
        )}
      >
        <button
          type="button"
          ref={(node) => {
            button.current = node;
            setActivatorNodeRef(node);
          }}
          {...attributes}
          onClick={onOpen}
          className="flex cursor-grab flex-col gap-2 text-left outline-none after:absolute after:inset-0 after:rounded-lg active:cursor-grabbing"
        >
          {children}
        </button>
        {extra}
      </BoardCardShell>
    </div>
  );
};
