import {
  IconArrowDown,
  IconArrowUp,
  IconPointer,
  IconX,
} from '@tabler/icons-react';
import { Button, Spinner } from 'erxes-ui';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  capturePageSelection,
  isSelectableElement,
  selectionGeometry,
  selectionTitle,
  selectionParent,
  SELECTION_EXCLUDED,
  type IPageSelection,
  type ISelectionRect,
} from '../utils/pageSelection';

export interface IPageElementPickerProps {
  onSelect: (selection: IPageSelection) => void;
  onCancel: () => void;
}

/** Trusted parent listeners also handle our script-disabled HTML preview frames. */
export const PageElementPicker = ({
  onSelect,
  onCancel,
}: IPageElementPickerProps) => {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [rect, setRect] = useState<ISelectionRect | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [error, setError] = useState('');
  const [blockedFrames, setBlockedFrames] = useState<ISelectionRect[]>([]);
  const targetRef = useRef(target);
  const busy = useRef(false);
  const mounted = useRef(true);
  const callbacks = useRef({ onSelect, onCancel });
  callbacks.current = { onSelect, onCancel };
  const chooseRef = useRef<(element: HTMLElement) => void>(() => undefined);

  chooseRef.current = (element) => {
    if (busy.current) return;
    busy.current = true;
    setCapturing(true);
    setError('');
    void capturePageSelection(element)
      .then((selection) => {
        if (mounted.current) callbacks.current.onSelect(selection);
      })
      .catch((reason: unknown) => {
        if (mounted.current) {
          setError(
            reason instanceof Error
              ? reason.message
              : 'Could not capture this element. Try another selection.',
          );
          setCapturing(false);
          busy.current = false;
        }
      });
  };

  useEffect(() => {
    mounted.current = true;
    const previousFocus = document.activeElement;
    const documents = new Set<Document>();
    const inaccessibleFrames = new Set<HTMLIFrameElement>();
    const cleanups: (() => void)[] = [];
    const refresh = () => {
      setBlockedFrames(
        Array.from(inaccessibleFrames)
          .filter((frame) => frame.isConnected)
          .map((frame) => selectionGeometry(frame).screen),
      );
      const element = targetRef.current;
      if (element?.isConnected && isSelectableElement(element)) {
        setRect(selectionGeometry(element).screen);
      } else {
        targetRef.current = null;
        setTarget(null);
        setRect(null);
      }
    };
    const focusElement = (element: HTMLElement | null) => {
      targetRef.current = element;
      setTarget(element);
      setError('');
      refresh();
    };
    const eventElement = (event: Event): HTMLElement | null => {
      const first = event
        .composedPath()
        .find(
          (node): node is Element =>
            typeof node === 'object' &&
            node !== null &&
            'nodeType' in node &&
            node.nodeType === 1,
        );
      if (!first || first.closest(SELECTION_EXCLUDED)) return null;
      let node: Element | null = first;
      while (node) {
        if (isSelectableElement(node)) return node;
        node = selectionParent(node);
      }
      return null;
    };
    const isControl = (event: Event) =>
      event
        .composedPath()
        .some(
          (node) =>
            node instanceof Element &&
            !!node.closest('[data-agent-selection-ui]'),
        );
    const suppress = (event: Event) => {
      if (isControl(event)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
    };
    const move = (event: Event) => {
      if (!busy.current && !isControl(event)) focusElement(eventElement(event));
    };
    const click = (event: Event) => {
      if (isControl(event)) return;
      suppress(event);
      const element = eventElement(event);
      if (element && !busy.current) {
        focusElement(element);
        chooseRef.current(element);
      }
    };
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopImmediatePropagation();
        callbacks.current.onCancel();
        return;
      }
      if (isControl(event) || busy.current) return;
      const element = targetRef.current;
      if (!element) return;
      if (event.key === 'Enter') {
        suppress(event);
        chooseRef.current(element);
      } else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        suppress(event);
        const next =
          event.key === 'ArrowUp'
            ? selectionParent(element)
            : Array.from(element.children).find(isSelectableElement);
        if (next && isSelectableElement(next)) focusElement(next);
      } else if (
        event.key.length === 1 ||
        event.key === 'Backspace' ||
        event.key === 'Delete'
      ) {
        suppress(event);
      }
    };
    const scan = (doc: Document) => {
      if (documents.has(doc)) return;
      documents.add(doc);
      const view = doc.defaultView;
      const oldCursor = doc.documentElement.style.cursor;
      doc.documentElement.style.cursor = 'crosshair';
      const cursorStyle = doc.createElement('style');
      cursorStyle.textContent =
        '*:not([data-agent-selection-ui], [data-agent-selection-ui] *) { cursor: crosshair !important; }';
      doc.head.append(cursorStyle);
      doc.addEventListener('pointermove', move, true);
      doc.addEventListener('pointerdown', suppress, true);
      doc.addEventListener('pointerup', suppress, true);
      doc.addEventListener('click', click, true);
      doc.addEventListener('dblclick', suppress, true);
      doc.addEventListener('contextmenu', suppress, true);
      doc.addEventListener('keydown', keydown, true);
      doc.addEventListener('scroll', refresh, true);
      view?.addEventListener('resize', refresh);
      const scanFrames = () => {
        let changed = false;
        for (const frame of Array.from(doc.querySelectorAll('iframe'))) {
          if (frame.closest('[data-agent-selection-ignore]')) continue;
          let child: Document | null = null;
          try {
            child = frame.contentDocument;
          } catch {
            /* Cross-origin documents remain isolated. */
          }
          if (child?.body) {
            changed = inaccessibleFrames.delete(frame) || changed;
            scan(child);
          } else if (!inaccessibleFrames.has(frame)) {
            inaccessibleFrames.add(frame);
            changed = true;
          }
        }
        for (const frame of inaccessibleFrames) {
          if (!frame.isConnected) {
            inaccessibleFrames.delete(frame);
            changed = true;
          }
        }
        if (changed) refresh();
      };
      doc.addEventListener('load', scanFrames, true);
      const observer = new MutationObserver(scanFrames);
      observer.observe(doc.body, { childList: true, subtree: true });
      cleanups.push(() => {
        observer.disconnect();
        cursorStyle.remove();
        doc.documentElement.style.cursor = oldCursor;
        doc.removeEventListener('pointermove', move, true);
        doc.removeEventListener('pointerdown', suppress, true);
        doc.removeEventListener('pointerup', suppress, true);
        doc.removeEventListener('click', click, true);
        doc.removeEventListener('dblclick', suppress, true);
        doc.removeEventListener('contextmenu', suppress, true);
        doc.removeEventListener('keydown', keydown, true);
        doc.removeEventListener('scroll', refresh, true);
        doc.removeEventListener('load', scanFrames, true);
        view?.removeEventListener('resize', refresh);
      });
      scanFrames();
    };
    scan(document);
    const initial = document.elementFromPoint?.(
      Math.round(innerWidth / 3),
      Math.round(innerHeight / 2),
    );
    if (initial && isSelectableElement(initial)) focusElement(initial);
    return () => {
      mounted.current = false;
      cleanups.forEach((cleanup) => cleanup());
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected)
        previousFocus.focus({ preventScroll: true });
    };
  }, []);

  return (
    <>
      {createPortal(
        <div
          data-agent-selection-ui=""
          className="pointer-events-none fixed inset-0 z-[100]"
        >
          <div
            className="pointer-events-auto absolute left-1/2 top-4 flex w-max max-w-[calc(100vw-24px)] -translate-x-1/2 items-center gap-3 rounded-xl border bg-popover px-3 py-2 text-popover-foreground shadow-lg"
            role="region"
            aria-label="Page selection"
          >
            {capturing ? (
              <Spinner className="size-4 shrink-0" />
            ) : (
              <IconPointer className="size-4 shrink-0 text-primary" />
            )}
            <div
              className="min-w-0 text-xs leading-5"
              role="status"
              aria-live="polite"
            >
              <p className="font-medium">
                {capturing
                  ? 'Capturing selection…'
                  : 'Select anything on the page'}
              </p>
              {error ? (
                <p
                  role="alert"
                  className="max-w-72 text-[11px] text-destructive"
                >
                  {error}
                </p>
              ) : (
                <p className="hidden text-[11px] text-muted-foreground sm:block">
                  Click to attach · ↑ parent · ↓ child · Esc to cancel
                </p>
              )}
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="size-7 shrink-0"
              onClick={onCancel}
              aria-label="Cancel page selection"
            >
              <IconX className="size-4" />
            </Button>
          </div>
          {blockedFrames.map((frameRect, index) => (
            <Button
              key={index}
              type="button"
              variant="ghost"
              aria-label="Embedded content cannot be selected"
              className="pointer-events-auto absolute rounded-none bg-transparent p-0 hover:bg-primary/5"
              style={{
                left: frameRect.x,
                top: frameRect.y,
                width: frameRect.width,
                height: frameRect.height,
                cursor: 'not-allowed',
              }}
              onClick={() => {
                targetRef.current = null;
                setTarget(null);
                setRect(null);
                setError(
                  'This embedded page blocks selection. Choose a component outside the frame.',
                );
              }}
            />
          ))}
          {rect &&
            target &&
            !capturing &&
            rect.width > 0 &&
            rect.height > 0 && (
              <div
                className="absolute rounded-sm border-2 border-primary bg-primary/5 shadow-[0_0_0_1px_var(--background)]"
                style={{
                  left: rect.x,
                  top: rect.y,
                  width: rect.width,
                  height: rect.height,
                }}
              >
                <div
                  className="absolute left-0 max-w-[min(280px,70vw)] truncate rounded bg-primary px-2 py-1 font-mono text-[10px] text-primary-foreground"
                  style={{ top: rect.y > 96 ? -29 : 4 }}
                >
                  {target.tagName.toLowerCase()} · {Math.round(rect.width)} ×{' '}
                  {Math.round(rect.height)}
                </div>
              </div>
            )}
          {target && !capturing && (
            <div className="pointer-events-auto absolute bottom-5 left-1/2 flex w-max max-w-[calc(100vw-24px)] -translate-x-1/2 items-center gap-2 rounded-xl border bg-popover p-2 shadow-lg">
              <p
                className="min-w-0 max-w-48 flex-1 truncate px-1 text-xs"
                title={error || selectionTitle(target)}
              >
                {selectionTitle(target)}
              </p>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 shrink-0"
                aria-label="Select parent element"
                onClick={() => {
                  const parent = selectionParent(target);
                  if (parent && isSelectableElement(parent)) {
                    targetRef.current = parent;
                    setTarget(parent);
                    setRect(selectionGeometry(parent).screen);
                  }
                }}
              >
                <IconArrowUp className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 shrink-0"
                aria-label="Select child element"
                onClick={() => {
                  const child = Array.from(target.children).find(
                    isSelectableElement,
                  );
                  if (child) {
                    targetRef.current = child;
                    setTarget(child);
                    setRect(selectionGeometry(child).screen);
                  }
                }}
              >
                <IconArrowDown className="size-4" />
              </Button>
              <Button
                size="sm"
                className="h-8 shrink-0 text-xs"
                onClick={() => chooseRef.current(target)}
              >
                {error ? 'Retry' : 'Attach selection'}
              </Button>
            </div>
          )}
        </div>,
        document.body,
      )}
    </>
  );
};
