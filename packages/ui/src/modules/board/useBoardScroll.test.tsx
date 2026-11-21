// @vitest-environment happy-dom
import { describe, expect, it } from 'vite-plus/test';
import { setupDomRender } from '../../lib/render-in-dom';
import { Board } from './Board';

const render = setupDomRender();

/** happy-dom lays nothing out: give a box the sizes a browser would. */
const sized = (box: HTMLElement, sizes: Record<string, number>) => {
  for (const [name, value] of Object.entries(sizes)) {
    Object.defineProperty(box, name, { configurable: true, value });
  }
};

/** A board three columns wide in a frame one column wide. */
const wideBoard = () => {
  const page = render(
    <Board onMove={() => undefined}>
      {['Todo', 'Doing', 'Done'].map((name) => (
        <Board.Column key={name} id={name} title={name} count={0} empty="Nothing here">
          {null}
        </Board.Column>
      ))}
    </Board>,
  );

  const board = page.querySelector<HTMLElement>('.board-scroll');

  if (!board) throw new Error('The board did not render');

  sized(board, { scrollWidth: 900, clientWidth: 300 });

  return { page, board };
};

const wheel = (target: Element, deltaY: number, init: WheelEventInit = {}) => {
  const event = new WheelEvent('wheel', { deltaY, bubbles: true, cancelable: true, ...init });

  // happy-dom's WheelEvent drops the modifier keys a browser's keeps.
  Object.defineProperty(event, 'shiftKey', { value: init.shiftKey ?? false });
  target.dispatchEvent(event);

  return event;
};

/** A left-button mouse event at `clientX`. */
const pointer = (type: string, clientX: number) =>
  new PointerEvent(type, { clientX, button: 0, pointerType: 'mouse', bubbles: true });

describe('a board wider than the screen', () => {
  it('scrolls sideways when the wheel turns over a column with nothing to scroll', () => {
    const { page, board } = wideBoard();
    const header = page.querySelector('header');

    if (!header) throw new Error('No column header');

    const event = wheel(header, 120);

    expect(event.defaultPrevented).toBe(true);
    expect(board.scrollLeft).toBe(120);
  });

  it('leaves the wheel to a column whose cards scroll that way', () => {
    const { page, board } = wideBoard();
    const header = page.querySelector('header');
    const cards = header?.nextElementSibling;

    if (!(cards instanceof HTMLElement)) throw new Error('No card list');

    cards.style.overflowY = 'auto';
    sized(cards, { scrollHeight: 800, clientHeight: 400, scrollTop: 0 });

    const event = wheel(cards, 120);

    expect(event.defaultPrevented).toBe(false);
    expect(board.scrollLeft).toBe(0);
  });

  it('keeps Shift + wheel and sideways swipes as the browser does them', () => {
    const { board } = wideBoard();

    expect(wheel(board, 120, { shiftKey: true }).defaultPrevented).toBe(false);
    expect(wheel(board, 10, { deltaX: 80 }).defaultPrevented).toBe(false);
    expect(board.scrollLeft).toBe(0);
  });

  it('pans when a mouse drags empty board', () => {
    const { board } = wideBoard();

    board.dispatchEvent(pointer('pointerdown', 400));
    window.dispatchEvent(pointer('pointermove', 250));

    expect(board.scrollLeft).toBe(150);
    expect(board.dataset.panning).toBe('');

    window.dispatchEvent(pointer('pointerup', 250));
    window.dispatchEvent(pointer('pointermove', 100));

    expect(board.scrollLeft).toBe(150);
    expect(board.dataset.panning).toBeUndefined();
  });
});
