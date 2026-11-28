// @vitest-environment happy-dom
import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import { setupDomRender } from '../../../lib/render-in-dom';
import { RecordTableProvider } from './RecordTableProvider';
import { RecordTableRowSkeleton } from './RecordTableRowSkeleton';

const render = setupDomRender();

/**
 * The browser's IntersectionObserver, reduced to what decides when a placeholder reports: the
 * area below the visible one it watches (`rootMargin`), and a way to say the row reached it.
 */
class Observer {
  static all: Observer[] = [];
  readonly rootMargin: string;

  constructor(
    private readonly report: (entries: Partial<IntersectionObserverEntry>[]) => void,
    options: IntersectionObserverInit = {},
  ) {
    this.rootMargin = options.rootMargin ?? '0px';
    Observer.all.push(this);
  }

  private watched: Element[] = [];

  observe(element: Element) {
    this.watched.push(element);
  }

  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }

  /** The watched row is `distance` pixels below the visible area of a 600 pixel high list. */
  rowAt(distance: number) {
    const bottom = this.rootMargin.split(' ')[2] ?? '0px';
    const ahead = bottom.endsWith('%') ? (600 * Number.parseFloat(bottom)) / 100 : 0;
    const isIntersecting = distance <= ahead;

    act(() =>
      this.report(
        this.watched.map((target) => ({
          target,
          isIntersecting,
          intersectionRatio: isIntersecting ? 1 : 0,
        })),
      ),
    );
  }
}

const table = (skeleton: React.ReactNode) => (
  <RecordTableProvider columns={[{ id: 'name' }]} data={[]} tableId="skeleton-test">
    <table>
      <tbody>{skeleton}</tbody>
    </table>
  </RecordTableProvider>
);

describe('RecordTableRowSkeleton', () => {
  beforeEach(() => {
    Observer.all = [];
    vi.stubGlobal('IntersectionObserver', Observer);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('asks for the next page a screen before the list ends', () => {
    const handleInView = vi.fn<() => void>();

    render(table(<RecordTableRowSkeleton handleInView={handleInView} loaded={100} />));

    Observer.all.at(-1)?.rowAt(1200);
    expect(handleInView).not.toHaveBeenCalled();

    // Half a screen below the visible rows: the next page starts loading now.
    Observer.all.at(-1)?.rowAt(300);
    expect(handleInView).toHaveBeenCalledTimes(1);
  });

  it('asks for the previous page only once the top is in view', () => {
    const handleInView = vi.fn<() => void>();

    render(table(<RecordTableRowSkeleton backward rows={3} handleInView={handleInView} />));

    Observer.all.at(-1)?.rowAt(300);
    expect(handleInView).not.toHaveBeenCalled();

    Observer.all.at(-1)?.rowAt(0);
    expect(handleInView).toHaveBeenCalledTimes(1);
  });
});
