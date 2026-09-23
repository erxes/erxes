import { useRef } from 'react';
import type { ImperativePanelHandle } from 'react-resizable-panels';

export const useComposerPanelResize = () => {
  const inputPanelRef = useRef<ImperativePanelHandle>(null);

  const expandForContent = (target: EventTarget) => {
    if (!(target instanceof Element)) return;
    const editor = target.closest<HTMLElement>('[data-composer-editor]');
    const group = editor?.closest<HTMLElement>('[data-panel-group]');
    if (!editor || !group) return;

    requestAnimationFrame(() => {
      const panel = inputPanelRef.current;
      const overflow = editor.scrollHeight - editor.clientHeight;
      if (!panel || !group.clientHeight || overflow <= 2) return;

      panel.resize(
        Math.min(
          100,
          Math.ceil(panel.getSize() + (overflow / group.clientHeight) * 100),
        ),
      );
    });
  };

  return { inputPanelRef, expandForContent };
};
