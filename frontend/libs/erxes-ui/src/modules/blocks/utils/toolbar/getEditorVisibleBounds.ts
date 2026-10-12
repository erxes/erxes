import type { EditorVisibleBounds } from '../../types/toolbar/EditorVisibleBounds';

export const getEditorVisibleBounds = (
  editor: HTMLElement,
): EditorVisibleBounds => {
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
    if (!/(auto|scroll|hidden|clip)/.test(style.overflowY + style.overflowX))
      continue;
    const rect = parent.getBoundingClientRect();
    top = Math.max(top, rect.top);
    bottom = Math.min(bottom, rect.bottom);
    left = Math.max(left, rect.left);
    right = Math.min(right, rect.right);
  }
  return { top, bottom, left, right };
};
