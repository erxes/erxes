import {
  animateNavigationDisclosure,
  collectFollowingShifts,
} from '@/navigation/utils/navigationDisclosureMotion';

interface IAnimateCall {
  element: Element;
  keyframes: Keyframe[];
  options: KeyframeAnimationOptions;
  animation: { cancel: jest.Mock; onfinish: (() => void) | null };
}

const buildRail = () => {
  document.body.innerHTML = `
    <div id="root" style="overflow-y: auto">
      <div id="before"></div>
      <section id="plugins">
        <div id="first">
          <button></button>
          <div id="first-disclosure"><div id="first-content"></div></div>
        </div>
        <div id="middle"></div>
        <div id="second">
          <button></button>
          <div id="second-disclosure"><div id="second-content"></div></div>
        </div>
        <div id="last"></div>
        <span id="floating" style="position: absolute"></span>
      </section>
      <div id="more"></div>
    </div>
  `;

  const byId = (id: string) => document.getElementById(id) as HTMLElement;

  return byId;
};

describe('collectFollowingShifts', () => {
  it('shifts every in-flow element after the disclosure up to the root', () => {
    const byId = buildRail();
    const shifts = new Map<Element, number>();

    collectFollowingShifts(byId('first-disclosure'), byId('root'), 40, shifts);

    expect([...shifts.keys()].map((element) => element.id)).toEqual([
      'middle',
      'second',
      'last',
      'more',
    ]);
    expect(shifts.get(byId('more'))).toBe(40);
  });

  it('adds up the shifts of several disclosures', () => {
    const byId = buildRail();
    const shifts = new Map<Element, number>();

    collectFollowingShifts(byId('first-disclosure'), byId('root'), -40, shifts);
    collectFollowingShifts(byId('second-disclosure'), byId('root'), 60, shifts);

    expect(shifts.get(byId('middle'))).toBe(-40);
    expect(shifts.get(byId('last'))).toBe(20);
    expect(shifts.get(byId('more'))).toBe(20);
    expect(shifts.has(byId('second-content'))).toBe(false);
  });
});

describe('animateNavigationDisclosure', () => {
  let calls: IAnimateCall[];
  let reduceMotion: boolean;
  const originalAnimate = Element.prototype.animate;
  const originalMatchMedia = window.matchMedia;

  const flush = () => Promise.resolve();

  const callFor = (element: Element) =>
    calls.find((call) => call.element === element);

  beforeEach(() => {
    calls = [];
    reduceMotion = false;
    Element.prototype.animate = jest.fn(function (
      this: Element,
      keyframes: Keyframe[],
      options: KeyframeAnimationOptions,
    ) {
      const animation = { cancel: jest.fn(), onfinish: null };

      calls.push({ element: this, keyframes, options, animation });

      return animation as unknown as Animation;
    }) as unknown as typeof Element.prototype.animate;
    window.matchMedia = jest.fn(() => ({
      matches: reduceMotion,
    })) as unknown as typeof window.matchMedia;
  });

  afterEach(() => {
    Element.prototype.animate = originalAnimate;
    window.matchMedia = originalMatchMedia;
  });

  const setHeight = (element: HTMLElement, height: number) =>
    Object.defineProperty(element, 'offsetHeight', { value: height });

  it('reveals the content top-down and slides the following rows from their old place', async () => {
    const byId = buildRail();

    setHeight(byId('second-content'), 120);
    animateNavigationDisclosure(
      byId('second-disclosure'),
      byId('second-content'),
      true,
    );
    await flush();

    expect(callFor(byId('second-disclosure'))?.keyframes).toEqual([
      { transform: 'translateY(-120px)' },
      { transform: 'translateY(0px)' },
    ]);
    expect(callFor(byId('second-content'))?.keyframes).toEqual([
      { transform: 'translateY(120px)', opacity: 0 },
      { transform: 'translateY(0px)', opacity: 1 },
    ]);
    expect(callFor(byId('last'))?.keyframes).toEqual([
      { transform: 'translateY(-120px)' },
      { transform: 'none' },
    ]);
    expect(callFor(byId('middle'))).toBeUndefined();
    expect(callFor(byId('floating'))).toBeUndefined();
  });

  it('animates the rows between two disclosures by their combined shift', async () => {
    const byId = buildRail();

    setHeight(byId('first-content'), 80);
    setHeight(byId('second-content'), 120);
    animateNavigationDisclosure(
      byId('first-disclosure'),
      byId('first-content'),
      false,
    );
    animateNavigationDisclosure(
      byId('second-disclosure'),
      byId('second-content'),
      true,
    );
    await flush();

    expect(calls.filter((call) => call.element === byId('last'))).toHaveLength(
      1,
    );
    expect(callFor(byId('middle'))?.keyframes[0]).toEqual({
      transform: 'translateY(80px)',
    });
    expect(callFor(byId('last'))?.keyframes[0]).toEqual({
      transform: 'translateY(-40px)',
    });
  });

  it('keeps a collapsing disclosure painted until its animation ends', async () => {
    const byId = buildRail();
    const container = byId('first-disclosure');

    setHeight(byId('first-content'), 80);
    animateNavigationDisclosure(container, byId('first-content'), false);
    await flush();

    expect(container.style.height).toBe('80px');
    expect(container.style.marginBottom).toBe('-80px');
    expect(container.style.visibility).toBe('visible');
    expect(container.style.pointerEvents).toBe('none');
    expect(callFor(container)?.keyframes).toEqual([
      { transform: 'translateY(0px)' },
      { transform: 'translateY(-80px)' },
    ]);

    callFor(container)?.animation.onfinish?.();

    expect(container.style.height).toBe('');
    expect(container.style.marginBottom).toBe('');
    expect(container.style.visibility).toBe('');
    expect(container.style.pointerEvents).toBe('');
    expect(callFor(byId('first-content'))?.animation.cancel).toHaveBeenCalled();
  });

  it('does nothing when the user prefers reduced motion', async () => {
    const byId = buildRail();

    reduceMotion = true;
    animateNavigationDisclosure(
      byId('first-disclosure'),
      byId('first-content'),
      true,
    );
    await flush();

    expect(calls).toHaveLength(0);
  });
});
