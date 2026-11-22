// @vitest-environment happy-dom
import { act, useState } from 'react';
import { describe, expect, it, vi } from 'vite-plus/test';
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

const ROW = 32;

/**
 * Rows `ids`, ROW pixels each under a ROW-high header, in the list's scrolling element, after
 * `skeletons` rows without an id, as the backward skeleton draws above a list with earlier rows.
 */
const Rows = ({
  ids,
  skeletons = 0,
  hasPreviousPage,
}: {
  ids: string[];
  skeletons?: number;
  hasPreviousPage?: boolean;
}) => (
  <RecordTableCursorProvider
    dataLength={ids.length}
    sessionKey="row-test"
    hasNextPage
    hasPreviousPage={hasPreviousPage}
    offset={skeletons * ROW}
  >
    <table>
      <thead>
        <tr>
          <th>Name</th>
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: skeletons }, (_, index) => (
          <tr key={`skeleton-${index}`}>
            <td>…</td>
          </tr>
        ))}
        {ids.map((id) => (
          <tr key={id} id={id}>
            <td>{id}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </RecordTableCursorProvider>
);

const scrollerOf = (element: Element | null) =>
  element?.closest<HTMLElement>('[style*="overflow: scroll"]') ?? null;

/** Lays the rows out as a browser would: the header at the top, rows by index and scroll. */
const layOut = () =>
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
    this: HTMLElement,
  ) {
    const index = this.matches('tbody > tr')
      ? [...(this.parentElement?.children ?? [])].indexOf(this)
      : -1;

    const top = index < 0 ? 0 : ROW + index * ROW - (scrollerOf(this)?.scrollTop ?? 0);
    const height = this.tagName === 'THEAD' || index >= 0 ? ROW : 600;

    return DOMRect.fromRect({ x: 0, y: top, width: 100, height });
  });

describe('RecordTableCursorProvider', () => {
  it('reopens at the first row the header covered no more of, even when the list starts there', async () => {
    const rects = layOut();
    const ids = Array.from({ length: 50 }, (_, index) => `row-${index}`);
    const first = render(<Rows ids={ids} />);
    const scroller = scrollerOf(first.querySelector('tbody'));

    // Ten rows and a third of the next are scrolled under the header.
    act(() => {
      if (!scroller) return;
      scroller.scrollTop = 10 * ROW + 10;
      scroller.dispatchEvent(new Event('scroll'));
    });
    await act(() => new Promise<void>((resolve) => setTimeout(resolve, 300)));

    // The list reopens from that row: row-10 shows under the header, 10 px of it scrolled past.
    first.remove();
    const again = render(<Rows ids={ids.slice(10)} />);
    const reopened = scrollerOf(again.querySelector('tbody'));

    expect(reopened?.scrollTop).toBe(10);
    rects.mockRestore();
  });

  it('keeps the restored row in place when the list learns it has earlier rows', async () => {
    const rects = layOut();
    const ids = Array.from({ length: 50 }, (_, index) => `row-${index}`);
    const first = render(<Rows ids={ids} />);
    const scroller = scrollerOf(first.querySelector('tbody'));

    act(() => {
      if (!scroller) return;
      scroller.scrollTop = 10 * ROW + 10;
      scroller.dispatchEvent(new Event('scroll'));
    });
    await act(() => new Promise<void>((resolve) => setTimeout(resolve, 300)));
    first.remove();

    // Reopened at row-10 under three skeleton rows; that there are earlier rows comes after.
    const Reopened = () => {
      const [known, setKnown] = useState<boolean>();

      return (
        <>
          <button type="button" onClick={() => setKnown(true)}>
            Earlier rows
          </button>
          <Rows ids={ids.slice(10)} skeletons={3} hasPreviousPage={known} />
        </>
      );
    };

    const again = render(<Reopened />);
    const reopened = scrollerOf(again.querySelector('tbody'));

    act(() => again.querySelector('button')?.click());

    // row-10 still shows under the header with 10 px of it scrolled past.
    expect(reopened?.scrollTop).toBe(3 * ROW + 10);
    rects.mockRestore();
  });

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
