import type { EditorVisibleBounds } from 'erxes-ui/modules/blocks/types/toolbar/EditorVisibleBounds';

export const getEditorVisibleBounds = (
  editor: HTMLElement,
): EditorVisibleBounds => {
  const bounds = editor.getBoundingClientRect();
  let top = 0;
  let bottom = window.innerHeight;
  let left = Math.max(0, bounds.left);
  let right = Math.min(window.innerWidth, bounds.right);
  for (
    let parent = editor.parentElement;
    parent;
    parent = parent.parentElement
  ) {
    const style = getComputedStyle(parent);
    const clipsY = /(auto|scroll|hidden|clip)/.test(style.overflowY);
    const clipsX = /(auto|scroll|hidden|clip)/.test(style.overflowX);
    if (!clipsY && !clipsX) continue;
    const rect = parent.getBoundingClientRect();
    if (clipsY) {
      top = Math.max(top, rect.top);
      bottom = Math.min(bottom, rect.bottom);
    }
    if (clipsX) {
      left = Math.max(left, rect.left);
      right = Math.min(right, rect.right);
    }
  }
  return { top, bottom, left, right };
};
