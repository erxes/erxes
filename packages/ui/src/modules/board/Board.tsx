import { Skeleton } from '../../components/skeleton';
import { BoardCard } from './BoardCard';
import { BoardColumn } from './BoardColumn';
import { BoardRoot } from './BoardRoot';

const COLUMN_SKELETONS = ['first', 'second', 'third', 'fourth'];

/** Stands in for the columns while they load. */
const BoardSkeleton = () => (
  <div className="flex min-h-0 flex-1 gap-3 p-3" aria-busy>
    {COLUMN_SKELETONS.map((key) => (
      <Skeleton key={key} radius="xl" className="h-full w-72 shrink-0" />
    ))}
  </div>
);

/**
 * Cards in columns, such as leads by stage, to drag to another column.
 * The column under the pointer takes the card, whichever part of the card it holds; with
 * `ordered`, above the card under the pointer. `onMove` gets each drop: move the card in your
 * cache at once, and when the save fails, reload the columns so the card goes back. The dragged
 * copy then glides onto the card's new place. Touch drags start on a held press, and Space
 * picks a card up for the arrow keys.
 */
export const Board = Object.assign(BoardRoot, {
  Column: BoardColumn,
  Card: BoardCard,
  Skeleton: BoardSkeleton,
});
