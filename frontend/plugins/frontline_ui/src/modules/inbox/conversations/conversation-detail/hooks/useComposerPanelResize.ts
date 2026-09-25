import { useRef } from 'react';
import type { ImperativePanelHandle } from 'react-resizable-panels';

export const useComposerPanelResize = () => {
  const inputPanelRef = useRef<ImperativePanelHandle>(null);
  const contentHeightRef = useRef(0);
  const autoResizeStartRef = useRef<number | null>(null);

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
        panel.resize(25);
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
  };

  return {
    inputPanelRef,
    rememberContentHeight,
    resizeForContent,
    resetAutoResize,
  };
};
