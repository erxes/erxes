import { readPageFocus, type IPageFocus } from './pageFocusContract';
import { resolvePageElement } from './pageElements';

const statuses = new Map<string, string>();
const listeners = new Set<() => void>();
const delivered = new Set<string>();
let stopActive: (() => void) | undefined;
let generation = 0;
const keyFor = (focus: IPageFocus) => `${focus.snapshotId}:${focus.targetId}`;
export const subscribePageFocus = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
export const pageFocusStatus = (focus: IPageFocus) =>
  statuses.get(keyFor(focus)) ?? '';
const setStatus = (focus: IPageFocus, status: string) => {
  statuses.set(keyFor(focus), status);
  while (statuses.size > 100) {
    const oldest = statuses.keys().next().value;
    if (oldest === undefined) break;
    statuses.delete(oldest);
  }
  listeners.forEach((listener) => listener());
};
export const dismissPageFocus = () => {
  generation += 1;
  stopActive?.();
  stopActive = undefined;
};
export const showPageFocus = async (value: unknown): Promise<void> => {
  const focus = readPageFocus(value);
  if (!focus) return;
  dismissPageFocus();
  const request = generation;
  setStatus(focus, '');
  try {
    const { highlightPageElement } = await import('./pageFocusDriver');
    if (request !== generation) return;
    const element = resolvePageElement(
      focus.snapshotId,
      focus.targetId,
      focus.path,
    );
    if (!element)
      throw new Error(
        'This element has changed or is no longer on this page. Ask again from the current screen.',
      );
    stopActive = highlightPageElement(element, focus, () => {
      if (request === generation) stopActive = undefined;
    });
  } catch (error: unknown) {
    if (request === generation)
      setStatus(
        focus,
        error instanceof Error
          ? error.message
          : 'Could not show this element. Try again.',
      );
  }
};
/** A native live result can run once. History and reconnect replay never call this. */
export const showLivePageFocus = (toolCallId: string, value: unknown) => {
  const focus = readPageFocus(value);
  const key = `${toolCallId}:${focus?.snapshotId}`;
  if (!focus || delivered.has(key)) return;
  delivered.add(key);
  while (delivered.size > 100) {
    const oldest = delivered.values().next().value;
    if (oldest === undefined) break;
    delivered.delete(oldest);
  }
  void showPageFocus(focus);
};
