import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { type ReactNode, useId, useLayoutEffect, useMemo, useState } from 'react';
import { cn } from '../../lib/utils';
import { BoardCardShell } from './BoardCardShell';
import { type BoardCardEntry, BoardCards, BoardContext, type BoardTarget } from './boardContext';
import { useBoardAccessibility } from './boardAnnouncements';
import { boardKeyboard, glideToCard, pointerSlot } from './boardDrag';

/** A dropped card: its old and new column, and the card it now sits above. */
export type BoardMove = BoardTarget & { id: string; fromColumnId: string };

const KEYS = { start: ['Space'], cancel: ['Escape'], end: ['Space', 'Enter'] };

const useBoardSensors = (columnOf: (id: string) => string | undefined) =>
  useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
    useSensor(KeyboardSensor, { keyboardCodes: KEYS, coordinateGetter: boardKeyboard(columnOf) }),
  );

/** Where a drop lands, or nothing when it leaves the card where it was. */
const moveOf = (
  cards: BoardCards,
  ordered: boolean,
  { active, over }: Pick<DragEndEvent, 'active' | 'over'>,
): BoardMove | null => {
  const id = String(active.id);
  const from = cards.get(id)?.columnId;

  if (!from || !over || over.id === active.id) return null;

  const overId = String(over.id);
  const card = cards.get(overId);
  const columnId = card?.columnId ?? overId;

  if (!ordered && columnId === from) return null;

  return { id, fromColumnId: from, columnId, beforeId: card ? overId : null };
};

export const BoardRoot = ({
  ordered = false,
  onMove,
  children,
}: {
  ordered?: boolean;
  onMove: (move: BoardMove) => void;
  children: ReactNode;
}) => {
  const [drag] = useState(() => {
    const cards = new BoardCards();

    return {
      cards,
      collision: pointerSlot(cards.columnOf, cards.visible),
      dropAnimation: glideToCard(cards.moved),
    };
  });

  const { cards } = drag;
  const [dragging, setDragging] = useState<BoardCardEntry | null>(null);
  const [target, setTarget] = useState<BoardMove | null>(null);
  const [board, setBoard] = useState<HTMLDivElement | null>(null);
  const context = useMemo(() => ({ ordered, target, cards }), [ordered, target, cards]);
  const sensors = useBoardSensors(cards.columnOf);
  const accessibility = useBoardAccessibility(cards);
  // dnd-kit's own ids count from 0 in each copy of it, so a plugin's list would share them.
  const id = useId();

  useLayoutEffect(() => cards.setBoard(board), [cards, board]);

  const end = () => {
    setDragging(null);
    setTarget(null);
  };

  const onDragStart = ({ active }: DragStartEvent) => {
    cards.drop(false);
    cards.forgetFocus();
    setDragging(cards.get(String(active.id)) ?? null);
  };

  const onDragEnd = (event: DragEndEvent) => {
    end();

    const move = moveOf(cards, ordered, event);

    if (!move) return;

    cards.drop(true);

    if (event.activatorEvent instanceof KeyboardEvent) cards.refocus(move.id, move.columnId);

    onMove(move);
  };

  return (
    <BoardContext value={context}>
      <DndContext
        id={id}
        sensors={sensors}
        accessibility={accessibility}
        collisionDetection={drag.collision}
        onDragStart={onDragStart}
        onDragOver={(event) => setTarget(moveOf(cards, ordered, event))}
        onDragEnd={onDragEnd}
        onDragCancel={end}
      >
        <div
          ref={setBoard}
          className={cn(
            'flex min-h-0 flex-1 gap-3 overflow-x-auto p-3',
            dragging && 'cursor-grabbing',
          )}
        >
          {children}
        </div>
        <DragOverlay dropAnimation={drag.dropAnimation}>
          {dragging && <BoardCardShell overlay>{dragging.preview}</BoardCardShell>}
        </DragOverlay>
      </DndContext>
    </BoardContext>
  );
};
