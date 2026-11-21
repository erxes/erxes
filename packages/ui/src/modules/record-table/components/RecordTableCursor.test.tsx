// @vitest-environment happy-dom
import { act, useState } from 'react';
import { describe, expect, it } from 'vite-plus/test';
import { setupDomRender } from '../../../lib/render-in-dom';
import { RecordTableCursorProvider } from './RecordTableCursor';

const render = setupDomRender();

/** A cursor-paged list of 100 rows; its button stands in for the next page arriving. */
const List = () => {
  const [dataLength, setDataLength] = useState(100);

  return (
    <RecordTableCursorProvider dataLength={dataLength} sessionKey="cursor-test" hasNextPage>
      <button type="button" onClick={() => setDataLength((length) => length + 100)}>
        Next page
      </button>
    </RecordTableCursorProvider>
  );
};

/** The elements around the list's content, one of which scrolls it. */
const boxesOf = (container: HTMLElement) =>
  [...container.querySelectorAll<HTMLElement>('div')].filter((box) =>
    box.contains(container.querySelector('button')),
  );

describe('RecordTableCursorProvider', () => {
  it('reopens where the member left the list, and stays where they scroll as pages load', async () => {
    const first = render(<List />);

    // The member scrolls the list, and the position is kept once the scrolling pauses.
    act(() => {
      for (const box of boxesOf(first)) {
        box.scrollTop = 500;
        box.dispatchEvent(new Event('scroll'));
      }
    });
    await act(
      () =>
        new Promise<void>((resolve) => {
          setTimeout(resolve, 300);
        }),
    );

    // The list opens again at 500.
    const again = render(<List />);
    const scroller = boxesOf(again).find((box) => box.scrollTop === 500);

    expect(scroller).toBeDefined();

    // They scroll on before the next page arrives; the page leaves them there.
    if (scroller) scroller.scrollTop = 4000;

    act(() => again.querySelector('button')?.click());

    expect(scroller?.scrollTop).toBe(4000);
  });
});
