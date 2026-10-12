import type { ComponentProps } from 'react';
import type { FormattingToolbarController } from '@blocknote/react';

export const getToolbarPositioning = (
  getEditorElement: () => HTMLElement | undefined,
): ComponentProps<typeof FormattingToolbarController>['floatingOptions'] => ({
  middleware: [
    {
      name: 'editorBoundary',
      fn: ({ elements, rects, x, y }) => {
        const editor = getEditorElement();
        const selection = editor?.ownerDocument.getSelection();
        if (!editor || !selection?.rangeCount) return { x, y };

        const range = selection.getRangeAt(0);
        if (!editor.contains(range.commonAncestorContainer)) return { x, y };

        const bounds = editor.getBoundingClientRect();
        let top = Math.max(0, bounds.top);
        let bottom = Math.min(window.innerHeight, bounds.bottom);
        let left = Math.max(0, bounds.left);
        let right = Math.min(window.innerWidth, bounds.right);
        for (
          let parent = editor.parentElement;
          parent;
          parent = parent.parentElement
        ) {
          const style = getComputedStyle(parent);
          if (
            !/(auto|scroll|hidden|clip)/.test(style.overflowY + style.overflowX)
          )
            continue;
          const rect = parent.getBoundingClientRect();
          top = Math.max(top, rect.top);
          bottom = Math.min(bottom, rect.bottom);
          left = Math.max(left, rect.left);
          right = Math.min(right, rect.right);
        }

        const selected = range.getBoundingClientRect();
        const reference = elements.reference.getBoundingClientRect();
        const originX = reference.left - rects.reference.x;
        const originY = reference.top - rects.reference.y;
        const above = selected.top - rects.floating.height - 10;
        const alignedX = x + originX + selected.left - reference.left;
        elements.floating.style.visibility =
          selected.bottom <= top || selected.top >= bottom ? 'hidden' : '';
        return {
          x:
            Math.max(left, Math.min(alignedX, right - rects.floating.width)) -
            originX,
          y:
            Math.max(
              top,
              Math.min(
                above >= top ? above : selected.bottom + 10,
                bottom - rects.floating.height,
              ),
            ) - originY,
        };
      },
    },
  ],
  whileElementsMounted: (_reference, _floating, update) => {
    const editor = getEditorElement();
    if (!editor) return () => undefined;
    const observer = new ResizeObserver(update);
    for (
      let element: HTMLElement | null = editor;
      element;
      element = element.parentElement
    ) {
      observer.observe(element);
    }
    editor.ownerDocument.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    update();
    return () => {
      observer.disconnect();
      editor.ownerDocument.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  },
});
