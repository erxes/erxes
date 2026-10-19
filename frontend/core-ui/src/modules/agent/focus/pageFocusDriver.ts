import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import './pageFocus.css';
import type { IPageFocus } from './pageFocusContract';
import { resolvePageElement } from './pageElements';
import { selectionGeometry } from '../utils/pageSelection';

/** Driver owns placement, overlay, keyboard dismissal and focus trapping.
 * A parent-document anchor gives iframe targets correct viewport coordinates. */
export const highlightPageElement = (
  element: HTMLElement,
  focus: IPageFocus,
  onClose: () => void,
): (() => void) => {
  const previousFocus = document.activeElement;
  element.scrollIntoView({
    block: 'center',
    inline: 'nearest',
    behavior: 'instant',
  });
  let view = element.ownerDocument.defaultView;
  while (view?.frameElement) {
    view.frameElement.scrollIntoView({
      block: 'nearest',
      inline: 'nearest',
      behavior: 'instant',
    });
    view = view.frameElement.ownerDocument.defaultView;
  }
  const anchor = document.createElement('div');
  anchor.setAttribute('data-agent-selection-ui', '');
  anchor.setAttribute('aria-hidden', 'true');
  Object.assign(anchor.style, { position: 'fixed', pointerEvents: 'none' });
  const position = () => {
    const rect = selectionGeometry(element).screen;
    if (rect.width < 1 || rect.height < 1) return false;
    Object.assign(anchor.style, {
      left: `${rect.x}px`,
      top: `${rect.y}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
    });
    return true;
  };
  if (!position())
    throw new Error(
      'This element is outside the visible area. Open its section and ask again.',
    );
  document.body.append(anchor);
  let closed = false;
  let animation = 0;
  let lastRect = '';
  let lastValidation = -Infinity;
  const stop = () => {
    if (closed) return;
    closed = true;
    cancelAnimationFrame(animation);
    spotlight.destroy();
    anchor.remove();
    if (previousFocus instanceof HTMLElement && previousFocus.isConnected)
      previousFocus.focus({ preventScroll: true });
    onClose();
  };
  const spotlight = driver({
    animate: !matchMedia('(prefers-reduced-motion: reduce)').matches,
    smoothScroll: false,
    overlayOpacity: 0.4,
    stagePadding: 6,
    stageRadius: 8,
    allowClose: true,
    disableActiveInteraction: true,
    popoverClass: 'agent-page-focus',
    showButtons: ['next', 'close'],
    doneBtnText: 'Got it',
    nextBtnText: 'Got it',
    closeBtnLabel: 'Close guidance',
    onNextClick: stop,
    onDestroyed: stop,
    onPopoverRender: (popover) => {
      // Driver accepts HTML strings; model output must remain literal text.
      popover.title.textContent = focus.title;
      popover.description.textContent = focus.description;
      popover.wrapper.setAttribute('data-agent-selection-ui', '');
    },
  });
  try {
    spotlight.highlight({
      element: anchor,
      popover: {
        title: ' ',
        description: ' ',
        side: 'bottom',
        align: 'start',
        showButtons: ['next', 'close'],
        nextBtnText: 'Got it',
        doneBtnText: 'Got it',
        onNextClick: stop,
        onCloseClick: stop,
      },
    });
    const follow = (timestamp: number) => {
      if (closed) return;
      if (
        !element.isConnected ||
        (timestamp - lastValidation >= 250 &&
          resolvePageElement(focus.snapshotId, focus.targetId, focus.path) !==
            element) ||
        !position()
      ) {
        stop();
        return;
      }
      if (timestamp - lastValidation >= 250) lastValidation = timestamp;
      const rect = anchor.style.cssText;
      if (rect !== lastRect) {
        lastRect = rect;
        spotlight.refresh();
      }
      animation = requestAnimationFrame(follow);
    };
    animation = requestAnimationFrame(follow);
  } catch (error) {
    stop();
    throw error;
  }
  return stop;
};
