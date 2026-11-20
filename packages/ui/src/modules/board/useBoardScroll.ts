import { useEffect } from 'react';

/** What a press on the board starts no pan from: cards, controls and text a member edits. */
const NO_PAN =
  'a, button, input, select, textarea, label, [contenteditable], [role="button"], [aria-roledescription]';

/** Whether `node`, or a box between it and `board`, scrolls further down (`down`) or up. */
const scrollsVertically = (node: Element | null, board: HTMLElement, down: boolean) => {
  for (let box = node; box && box !== board; box = box.parentElement) {
    const { overflowY } = getComputedStyle(box);

    const scrolls =
      (overflowY === 'auto' || overflowY === 'scroll') && box.scrollHeight > box.clientHeight;

    if (
      scrolls &&
      (down ? box.scrollTop + box.clientHeight < box.scrollHeight - 1 : box.scrollTop > 0)
    ) {
      return true;
    }
  }

  return false;
};

/**
 * Scrolls a board sideways with a mouse wheel or a drag on empty board.
 * Columns past the screen's edge stay reachable without a trackpad. The wheel
 * scrolls the board sideways wherever nothing under the pointer scrolls down or up (a column's
 * header, its empty end, the gap between columns), and a press on empty board drags it sideways.
 * A trackpad's sideways swipe and Shift + wheel work as they always do. Give `board` the
 * `board-scroll` class: a scrollbar that stays in sight, and the grabbing hand while it pans.
 */
export const useBoardScroll = (board: HTMLElement | null) => {
  useEffect(() => {
    if (!board) return;

    const wheel = (event: WheelEvent) => {
      if (event.shiftKey || event.ctrlKey || Math.abs(event.deltaX) >= Math.abs(event.deltaY))
        return;

      if (board.scrollWidth <= board.clientWidth) return;

      if (
        event.target instanceof Element &&
        scrollsVertically(event.target, board, event.deltaY > 0)
      )
        return;

      event.preventDefault();
      board.scrollLeft +=
        event.deltaMode === WheelEvent.DOM_DELTA_LINE ? event.deltaY * 16 : event.deltaY;
    };

    // Where the running pan started; null while none runs.
    let start: { x: number; left: number } | null = null;

    const move = (event: PointerEvent) => {
      if (!start) return;

      const dx = event.clientX - start.x;

      if (!('panning' in board.dataset) && Math.abs(dx) < 4) return;

      board.dataset.panning = '';
      board.scrollLeft = start.left - dx;
    };

    const release = () => {
      start = null;
      delete board.dataset.panning;
    };

    const press = (event: PointerEvent) => {
      if (event.button !== 0 || event.pointerType !== 'mouse') return;

      if (!(event.target instanceof Element) || event.target.closest(NO_PAN)) return;

      start = { x: event.clientX, left: board.scrollLeft };
    };

    board.addEventListener('wheel', wheel, { passive: false });
    board.addEventListener('pointerdown', press);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', release);
    window.addEventListener('pointercancel', release);

    return () => {
      board.removeEventListener('wheel', wheel);
      board.removeEventListener('pointerdown', press);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', release);
      window.removeEventListener('pointercancel', release);
      release();
    };
  }, [board]);
};
