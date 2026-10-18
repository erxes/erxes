/** @jest-environment jsdom */
import { act, render } from '@testing-library/react';

import { BloubAvatar } from '../bloub/BloubAvatar';
import { makeBlock } from '../bloub/engine/cycles';

class MockIntersectionObserver {
  constructor(callback: IntersectionObserverCallback) {
    this.cb = callback;
  }
  cb: IntersectionObserverCallback;
  observe = (target: Element) => {
    this.cb(
      [{ isIntersecting: true, target } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    );
  };
  unobserve = () => undefined;
  disconnect = () => undefined;
}

describe('cycle playback', () => {
  it('advances blocks and calls onCycleEnd', () => {
    (globalThis as Record<string, unknown>).IntersectionObserver =
      MockIntersectionObserver;

    // controllable rAF pump
    const queue: FrameRequestCallback[] = [];
    let now = 0;
    (globalThis as Record<string, unknown>).requestAnimationFrame = (
      cb: FrameRequestCallback,
    ) => {
      queue.push(cb);
      return queue.length;
    };
    (globalThis as Record<string, unknown>).cancelAnimationFrame = () =>
      undefined;
    const pump = (ms: number) => {
      const end = now + ms;
      while (now < end) {
        now += 50; // ~20fps pump
        const cbs = queue.splice(0, queue.length);
        cbs.forEach((cb) => cb(now));
      }
    };

    const onEnd = jest.fn();
    const { container } = render(
      <BloubAvatar
        size={64}
        state="idle"
        paper="#fff"
        cycle={[makeBlock('hexagon'), makeBlock('alert')]}
        playing
        onCycleEnd={onEnd}
      />,
    );

    const pathOf = () => {
      const paths = [...container.querySelectorAll('path')].map(
        (p) => p.getAttribute('d') ?? '',
      );
      return paths.reduce((a, b) => (b.length > a.length ? b : a), '');
    };

    const before = pathOf();
    act(() => pump(4000)); // past hexagon's 1.6s + alert's start
    const mid = pathOf();
    act(() => pump(4000)); // past alert
    expect(pathOf()).toBeTruthy();

    expect(onEnd).toHaveBeenCalled();
    expect(before !== mid).toBe(true);
  });
});
