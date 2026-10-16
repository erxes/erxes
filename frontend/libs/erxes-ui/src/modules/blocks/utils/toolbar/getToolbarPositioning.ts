import { getEditorVisibleBounds } from 'erxes-ui/modules/blocks/utils/toolbar/getEditorVisibleBounds';
import type { ToolbarPositioningOptions } from 'erxes-ui/modules/blocks/types/toolbar/ToolbarPositioningOptions';

export const getToolbarPositioning = (
  getEditorElement: () => HTMLElement | undefined,
): ToolbarPositioningOptions => ({
  middleware: [
    {
      name: 'editorBoundary',
      fn: ({ elements, rects, x, y }) => {
        const editor = getEditorElement();
        if (!editor) return { x, y };

        const { top, bottom, left, right } = getEditorVisibleBounds(editor);
        const anchor = elements.reference.getBoundingClientRect();
        const maxWidth = `${Math.floor(Math.max(0, right - left))}px`;
        if (elements.floating.style.maxWidth !== maxWidth) {
          elements.floating.style.maxWidth = maxWidth;
          return { reset: { rects: true } };
        }
        const originX = anchor.left - rects.reference.x;
        const originY = anchor.top - rects.reference.y;
        const above = anchor.top - rects.floating.height - 10;
        elements.floating.style.visibility =
          anchor.bottom <= top || anchor.top >= bottom ? 'hidden' : '';
        return {
          x:
            Math.max(
              left,
              Math.min(x + originX, right - rects.floating.width),
            ) - originX,
          y:
            Math.max(
              top,
              Math.min(
                above >= top ? above : anchor.bottom + 10,
                bottom - rects.floating.height,
              ),
            ) - originY,
        };
      },
    },
  ],
  whileElementsMounted: (_reference, _floating, update) => {
    update();
    const editor = getEditorElement();
    if (!editor) return () => undefined;
    editor.ownerDocument.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      editor.ownerDocument.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  },
});
