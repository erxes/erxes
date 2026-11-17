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

const cardsIn = (slots: Slot[], columnOf: CardColumns, columnId: string) =>
  slots.filter(({ id }) => columnOf(id) === columnId).toSorted((a, b) => a.rect.top - b.rect.top);

/**
 * The drop target is where the pointer is, whichever part of the card it holds: the column
 * under it, above the first of its cards whose middle is below the pointer, or last. Outside
 * the board's visible box, where scrolled-away columns sit, nothing is. A drop that leaves
 * the card where it is targets the card itself. A keyboard drag goes by the dragged card's
 * middle, in the nearest column.
 */
export const pointerSlot =
  (columnOf: CardColumns, visible: () => ClientRect | undefined): CollisionDetection =>
  ({ active, collisionRect, droppableContainers, droppableRects, pointerCoordinates }) => {
    const point = pointerCoordinates ?? middle(collisionRect);
    const area = visible();

    if (pointerCoordinates && area && !holds(area, point)) return [];

    const slots = slotsOf(droppableContainers, droppableRects);
    const columns = slots.filter(({ id }) => columnOf(id) === undefined);

    const column = pointerCoordinates
      ? columns.find(({ rect }) => holds(rect, point))
      : columns.toSorted(byDistanceFrom(point))[0];

    if (!column) return [];

    const cards = cardsIn(slots, columnOf, column.id);

    const below = cards.findIndex(({ rect }) => middle(rect).y > point.y);
    const at = below === -1 ? cards.length : below;
    const own = String(active.id);

    if (cards[at]?.id === own || cards[at - 1]?.id === own) return [{ id: own }];

    return [{ id: cards[at]?.id ?? column.id }];
  };

/**
 * The arrow keys move a picked-up card one column across, or past the middle of the next card
 * up or down in its column (by its own height where there is none).
 */
export const boardKeyboard =
  (columnOf: CardColumns): KeyboardCoordinateGetter =>
  (
    event,
    { active, currentCoordinates, context: { collisionRect, droppableContainers, droppableRects } },
  ) => {
    if (!collisionRect || !ARROWS.includes(event.code)) return undefined;

    event.preventDefault();

    const slots = slotsOf(droppableContainers.getEnabled(), droppableRects);

    const columns = slots
      .filter(({ id }) => columnOf(id) === undefined)
      .toSorted((a, b) => a.rect.left - b.rect.left);

    const [here] = columns.toSorted(byDistanceFrom(middle(collisionRect)));

    if (event.code === 'ArrowUp' || event.code === 'ArrowDown') {
      const down = event.code === 'ArrowDown';
      const now = middle(collisionRect).y;

      const middles = (here ? cardsIn(slots, columnOf, here.id) : [])
        .filter(({ id }) => id !== String(active))
        .map(({ rect }) => middle(rect).y);

      const next = down ? middles.find((y) => y > now) : middles.findLast((y) => y < now);
      const step = collisionRect.height + CARD_GAP;
      const to = next === undefined ? now + (down ? step : -step) : next + (down ? 1 : -1);

      return { ...currentCoordinates, y: currentCoordinates.y + to - now };
    }

    const way = event.code === 'ArrowLeft' ? -1 : 1;
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
