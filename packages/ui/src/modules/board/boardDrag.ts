import type {
  ClientRect,
  CollisionDetection,
  DropAnimationFunction,
  KeyboardCoordinateGetter,
} from '@dnd-kit/core';

type Point = { x: number; y: number };

type Slot = { id: string; rect: ClientRect };

/** Which column each card on the board is in, by card id. */
export type CardColumns = (id: string) => string | undefined;

const LANDING_FRAMES = 12;

const CARD_GAP = 8;

const ARROWS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];

const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));

const middle = (rect: ClientRect) => ({
  x: rect.left + rect.width / 2,
  y: rect.top + rect.height / 2,
});

const holds = (rect: ClientRect, { x, y }: Point) =>
  rect.left <= x && x <= rect.right && rect.top <= y && y <= rect.bottom;

const byDistanceFrom =
  ({ x }: Point) =>
  (a: Slot, b: Slot) =>
    Math.abs(middle(a.rect).x - x) - Math.abs(middle(b.rect).x - x);

const slotsOf = (
  containers: { id: string | number }[],
  rects: ReadonlyMap<string | number, ClientRect>,
) =>
  containers.flatMap(({ id }) => {
    const rect = rects.get(id);

    return rect ? [{ id: String(id), rect }] : [];
  });

/**
 * The drop target is where the pointer is, whichever part of the card it holds: the column
 * under it, above the first of its cards whose middle is below the pointer, or last. A drop
 * that leaves the card where it is targets the card itself. A keyboard drag goes by the
 * dragged card's middle, in the nearest column.
 */
export const pointerSlot =
  (columnOf: CardColumns): CollisionDetection =>
  ({ active, collisionRect, droppableContainers, droppableRects, pointerCoordinates }) => {
    const point = pointerCoordinates ?? middle(collisionRect);
    const slots = slotsOf(droppableContainers, droppableRects);
    const columns = slots.filter(({ id }) => columnOf(id) === undefined);

    const column = pointerCoordinates
      ? columns.find(({ rect }) => holds(rect, point))
      : columns.toSorted(byDistanceFrom(point))[0];

    if (!column) return [];

    const cards = slots
      .filter(({ id }) => columnOf(id) === column.id)
      .toSorted((a, b) => a.rect.top - b.rect.top);

    const below = cards.findIndex(({ rect }) => middle(rect).y > point.y);
    const at = below === -1 ? cards.length : below;
    const own = String(active.id);

    if (cards[at]?.id === own || cards[at - 1]?.id === own) return [{ id: own }];

    return [{ id: cards[at]?.id ?? column.id }];
  };

/** The arrow keys move a picked-up card one column across, or one card up or down. */
export const boardKeyboard =
  (columnOf: CardColumns): KeyboardCoordinateGetter =>
  (
    event,
    { currentCoordinates, context: { collisionRect, droppableContainers, droppableRects } },
  ) => {
    if (!collisionRect || !ARROWS.includes(event.code)) return undefined;

    event.preventDefault();

    const step = collisionRect.height + CARD_GAP;

    if (event.code === 'ArrowUp') return { ...currentCoordinates, y: currentCoordinates.y - step };

    if (event.code === 'ArrowDown')
      return { ...currentCoordinates, y: currentCoordinates.y + step };

    const way = event.code === 'ArrowLeft' ? -1 : 1;

    const columns = slotsOf(droppableContainers.getEnabled(), droppableRects)
      .filter(({ id }) => columnOf(id) === undefined)
      .toSorted((a, b) => a.rect.left - b.rect.left);

    const [here] = columns.toSorted(byDistanceFrom(middle(collisionRect)));
    const next = here && columns[columns.indexOf(here) + way];

    if (!next) return undefined;

    return {
      x: next.rect.left + (next.rect.width - collisionRect.width) / 2,
      y: currentCoordinates.y,
    };
  };

/**
 * The dragged copy glides onto the card: where it landed when `moved()`, which takes a few
 * frames while the caller's cache takes the move, else back to where it was.
 */
export const glideToCard =
  (moved: () => boolean): DropAnimationFunction =>
  async ({ active, dragOverlay, draggableNodes, transform }) => {
    let card = active.node;

    for (let frame = 0; moved() && frame < LANDING_FRAMES; frame++) {
      card = draggableNodes.get(active.id)?.node.current ?? card;

      const { top, left } = card.getBoundingClientRect();

      if (card !== active.node || top !== active.rect.top || left !== active.rect.left) break;

      await nextFrame();
    }

    if (!card.isConnected) return;

    const to = card.getBoundingClientRect();
    const x = transform.x + to.left - dragOverlay.rect.left;
    const y = transform.y + to.top - dragOverlay.rect.top;

    const timing = {
      duration: matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 180,
      easing: 'cubic-bezier(0.2, 0, 0, 1)',
    };

    card.animate({ opacity: [0, 0] }, timing);
    await dragOverlay.node.animate(
      {
        transform: [
          `translate3d(${transform.x}px, ${transform.y}px, 0)`,
          `translate3d(${x}px, ${y}px, 0)`,
        ],
      },
      { ...timing, fill: 'forwards' },
    ).finished;
  };
