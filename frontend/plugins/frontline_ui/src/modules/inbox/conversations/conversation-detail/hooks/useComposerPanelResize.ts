import { useLayoutEffect, useRef, useState } from 'react';
import type { ImperativePanelHandle } from 'react-resizable-panels';

const MIN_COMPOSER_HEIGHT = 160;
const DEFAULT_COMPOSER_HEIGHT = 240;

const getDefaultSize = (height: number) =>
  Math.min(75, Math.max(30, (DEFAULT_COMPOSER_HEIGHT / height) * 100));

export const useComposerPanelResize = () => {
  const panelGroupRef = useRef<HTMLDivElement>(null);
  const inputPanelRef = useRef<ImperativePanelHandle>(null);
  const contentHeightRef = useRef(0);
  const autoResizeStartRef = useRef<number | null>(null);
  const initialSizeSetRef = useRef(false);
  const manuallyResizedRef = useRef(false);
  const [minSize, setMinSize] = useState(20);

  useLayoutEffect(() => {
    const group = panelGroupRef.current;
    if (!group) return;

    const updatePanelSize = () => {
      const panel = inputPanelRef.current;
      if (!panel || !group.clientHeight) return;

      const height = group.clientHeight;
      const nextMinSize = Math.min(
        70,
        Math.max(20, (MIN_COMPOSER_HEIGHT / height) * 100),
      );
      setMinSize(nextMinSize);

      if (
        !initialSizeSetRef.current ||
        (!manuallyResizedRef.current && autoResizeStartRef.current === null)
      ) {
        panel.resize(getDefaultSize(height));
        initialSizeSetRef.current = true;
      } else if (panel.getSize() < nextMinSize) {
        panel.resize(nextMinSize);
      }
    };

    const observer = new ResizeObserver(updatePanelSize);
    observer.observe(group);
    updatePanelSize();

    return () => observer.disconnect();
  }, []);

  const getEditor = (target: EventTarget) =>
    target instanceof Element
      ? target.closest<HTMLElement>('[data-composer-editor]')
      : null;

  const rememberContentHeight = (target: EventTarget) => {
    const editor = getEditor(target);
    contentHeightRef.current =
      editor?.querySelector<HTMLElement>('.bn-editor')?.scrollHeight ?? 0;
  };

  const resizeForContent = (target: EventTarget) => {
    const editor = getEditor(target);
    const group = editor?.closest<HTMLElement>('[data-panel-group]');
    if (!editor || !group) return;

    requestAnimationFrame(() => {
      const panel = inputPanelRef.current;
      const contentHeight =
        editor.querySelector<HTMLElement>('.bn-editor')?.scrollHeight ?? 0;
      const change = contentHeight - contentHeightRef.current;
      contentHeightRef.current = contentHeight;
      if (!panel || !group.clientHeight) return;

      if (editor.querySelector('[data-is-only-empty-block="true"]')) {
        panel.resize(getDefaultSize(group.clientHeight));
        autoResizeStartRef.current = null;
        return;
      }

      if (!change) return;

      const size = panel.getSize();
      if (size < 25 || (change < 0 && autoResizeStartRef.current === null))
        return;
      if (change > 0 && contentHeight <= editor.clientHeight) return;

      const startSize = autoResizeStartRef.current ?? size;
      const nextSize = Math.min(
        100,
        Math.max(
          startSize,
          Math.ceil(size + (change / group.clientHeight) * 100),
        ),
      );
      if (nextSize === size) return;

      panel.resize(nextSize);
      autoResizeStartRef.current = nextSize > startSize ? startSize : null;
    });
  };

  const resetAutoResize = () => {
    autoResizeStartRef.current = null;
    manuallyResizedRef.current = true;
  };

  return {
    panelGroupRef,
    inputPanelRef,
    minSize,
    rememberContentHeight,
    resizeForContent,
    resetAutoResize,
  };
};
