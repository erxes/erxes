/** @jest-environment jsdom */
import { render } from '@testing-library/react';

import { BloubAvatar } from '../bloub/BloubAvatar';
import { makeBlock } from '../bloub/engine/cycles';

/** jsdom has no IntersectionObserver — record observe calls instead. */
class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = [];
  private callback: IntersectionObserverCallback;

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
    MockIntersectionObserver.instances.push(this);
  }

  observe = (target: Element) => {
    this.callback(
      [
        {
          isIntersecting: true,
          target,
        } as IntersectionObserverEntry,
      ],
      this as unknown as IntersectionObserver,
    );
  };

  unobserve = () => undefined;
  disconnect = () => undefined;
}

describe('BloubAvatar', () => {
  beforeEach(() => {
    MockIntersectionObserver.instances = [];
    (globalThis as Record<string, unknown>).IntersectionObserver =
      MockIntersectionObserver;
  });

  it('renders an <svg> with a <mask> (eyes are mask holes)', () => {
    const { container } = render(
      <BloubAvatar size={64} state="idle" paper="#ffffff" frozenAt={1} />,
    );

    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(container.querySelector('mask')).not.toBeNull();
    // mask content: body path (white) punched by eye paths (black)
    const mask = container.querySelector('mask');
    expect(mask?.querySelectorAll('path').length).toBeGreaterThan(1);
  });

  it('renders the body paper-backed path and the masked ink rect', () => {
    const { container } = render(
      <BloubAvatar size={64} state="idle" paper="#ff0000" frozenAt={1} />,
    );

    const bodyGroup = container.querySelector('g[opacity]');
    const paths = bodyGroup?.querySelectorAll(':scope > path');
    expect(paths?.[0]?.getAttribute('fill')).toBe('#ff0000');
    const rect = bodyGroup?.querySelector('g[mask] > rect');
    expect(rect).not.toBeNull();
    expect(rect?.getAttribute('fill')).toBe('#0a0a0c');
  });

  it('uses unique mask/gradient ids per instance', () => {
    const { container } = render(
      <div>
        <BloubAvatar size={64} state="idle" paper="#fff" frozenAt={1} />
        <BloubAvatar size={64} state="idle" paper="#fff" frozenAt={1} />
      </div>,
    );

    const masks = container.querySelectorAll('mask');
    expect(masks.length).toBe(2);
    expect(masks[0]?.id).not.toBe(masks[1]?.id);
  });

  it('a frozen render never starts a rAF loop or observer', () => {
    const rafSpy = jest.spyOn(window, 'requestAnimationFrame');

    const { unmount } = render(
      <BloubAvatar size={64} state="orbit" paper="#fff" frozenAt={1.2} />,
    );

    expect(rafSpy).not.toHaveBeenCalled();
    expect(MockIntersectionObserver.instances).toHaveLength(0);
    unmount();
    rafSpy.mockRestore();
  });

  it('an animated render starts one rAF loop', () => {
    const rafSpy = jest
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation(() => 1);

    const { unmount } = render(
      <BloubAvatar size={64} state="idle" paper="#fff" />,
    );

    expect(rafSpy).toHaveBeenCalled();
    unmount();
    rafSpy.mockRestore();
  });

  it('accepts a showcase cycle while playing', () => {
    const rafSpy = jest
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation(() => 1);

    const { container, unmount } = render(
      <BloubAvatar
        size={64}
        state="idle"
        paper="#fff"
        cycle={[makeBlock('hexagon')]}
        playing
      />,
    );

    expect(container.querySelector('svg')).not.toBeNull();
    expect(rafSpy).toHaveBeenCalled();
    unmount();
    rafSpy.mockRestore();
  });
});
