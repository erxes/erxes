import { getEditorVisibleBounds } from './getEditorVisibleBounds';
import type { ToolbarPositioningOptions } from '../../types/toolbar/ToolbarPositioningOptions';

export const getToolbarPositioning = (
  getEditorElement: () => HTMLElement | undefined,
): ToolbarPositioningOptions => ({
  middleware: [
    {
      name: 'editorBoundary',
      fn: ({ elements, rects, x, y }) => {
        const editor = getEditorElement();
        const selection = editor?.ownerDocument.getSelection();
        if (!editor || !selection?.rangeCount) return { x, y };

        const range = selection.getRangeAt(0);
        if (!editor.contains(range.commonAncestorContainer)) return { x, y };

        const { top, bottom, left, right } = getEditorVisibleBounds(editor);

        const selected = range.getBoundingClientRect();
        const maxWidth = `${Math.floor(Math.max(0, right - left))}px`;
        if (elements.floating.style.maxWidth !== maxWidth) {
          elements.floating.style.maxWidth = maxWidth;
          return { reset: { rects: true } };
        }
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
