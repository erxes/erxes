import { NAVIGATION_EASE_CSS } from '@/navigation/constants/navigationMotion';

const DISCLOSURE_TIMING: KeyframeAnimationOptions = {
  duration: 250,
  easing: NAVIGATION_EASE_CSS,
};

interface IDisclosureChange {
  container: HTMLElement;
  content: HTMLElement;
  open: boolean;
}

interface IDisclosureAnimations {
  container: Animation;
  content: Animation;
}

const disclosureAnimations = new WeakMap<HTMLElement, IDisclosureAnimations>();
const shiftAnimations = new WeakMap<Element, Animation>();
let pendingChanges: IDisclosureChange[] = [];

const canAnimate = () =>
  typeof Element.prototype.animate === 'function' &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const getTranslateY = (element: Element) => {
  const { transform } = getComputedStyle(element);

  return transform && transform !== 'none'
    ? new DOMMatrixReadOnly(transform).m42
    : 0;
};

const translateY = (y: number) => `translateY(${y}px)`;

const findScrollRoot = (element: Element) => {
  for (let node = element.parentElement; node; node = node.parentElement) {
    const { overflowY } = getComputedStyle(node);

    if (overflowY === 'auto' || overflowY === 'scroll') {
      return node;
    }
  }

  return null;
};

const isInFlow = (element: Element) => {
  const { position } = getComputedStyle(element);

  return position !== 'absolute' && position !== 'fixed';
};

export const collectFollowingShifts = (
  element: Element,
  root: Element,
  delta: number,
  shifts: Map<Element, number>,
) => {
  for (
    let node: Element | null = element;
    node && node !== root;
    node = node.parentElement
  ) {
    for (
      let sibling = node.nextElementSibling;
      sibling;
      sibling = sibling.nextElementSibling
    ) {
      if (isInFlow(sibling)) {
        shifts.set(sibling, (shifts.get(sibling) ?? 0) + delta);
      }
    }
  }
};

const releaseContainer = (container: HTMLElement) => {
  container.style.removeProperty('height');
  container.style.removeProperty('margin-bottom');
  container.style.removeProperty('visibility');
  container.style.removeProperty('pointer-events');
};

const flushDisclosureChanges = () => {
  const changes = pendingChanges;
  const shifts = new Map<Element, number>();

  pendingChanges = [];

  const disclosureMotions = changes.map(({ container, content, open }) => {
    const height = content.offsetHeight;
    const root = findScrollRoot(container);
    const running = disclosureAnimations.has(container);
    const restingY = open ? -height : 0;

    if (root) {
      collectFollowingShifts(container, root, open ? height : -height, shifts);
    }

    return {
      container,
      content,
      open,
      height,
      fromY: running ? getTranslateY(container) : restingY,
      fromOpacity: running
        ? Number(getComputedStyle(content).opacity)
        : Number(!open),
    };
  });
  const shiftMotions = Array.from(shifts, ([element, delta]) => ({
    element,
    fromY: getTranslateY(element) - delta,
  }));

  for (const motion of disclosureMotions) {
    const { container, content, open, height, fromY } = motion;
    const toY = open ? 0 : -height;
    const timing: KeyframeAnimationOptions = {
      ...DISCLOSURE_TIMING,
      fill: open ? 'none' : 'forwards',
    };
    const previous = disclosureAnimations.get(container);

    previous?.container.cancel();
    previous?.content.cancel();
    releaseContainer(container);
    container.style.pointerEvents = 'none';

    if (!open) {
      container.style.height = `${height}px`;
      container.style.marginBottom = `${-height}px`;
      container.style.visibility = 'visible';
    }

    const animations = {
      container: container.animate(
        [{ transform: translateY(fromY) }, { transform: translateY(toY) }],
        timing,
      ),
      content: content.animate(
        [
          { transform: translateY(-fromY), opacity: motion.fromOpacity },
          { transform: translateY(-toY), opacity: Number(open) },
        ],
        timing,
      ),
    };

    disclosureAnimations.set(container, animations);
    animations.container.onfinish = () => {
      releaseContainer(container);
      animations.container.cancel();
      animations.content.cancel();
      disclosureAnimations.delete(container);
    };
  }

  for (const { element, fromY } of shiftMotions) {
    shiftAnimations.get(element)?.cancel();

    if (Math.abs(fromY) >= 0.5) {
      shiftAnimations.set(
        element,
        element.animate(
          [{ transform: translateY(fromY) }, { transform: 'none' }],
          DISCLOSURE_TIMING,
        ),
      );
    }
  }
};

export const animateNavigationDisclosure = (
  container: HTMLElement,
  content: HTMLElement,
  open: boolean,
) => {
  if (!canAnimate()) {
    return;
  }

  if (!pendingChanges.length) {
    queueMicrotask(flushDisclosureChanges);
  }

  pendingChanges.push({ container, content, open });
};
