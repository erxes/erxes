export const NAVIGATION_INLINE_ITEM_LIMIT = 5;

export type TNavigationPlacement = 'inline' | 'context';

export const getNavigationPlacement = (
  itemCount: number | undefined,
  hasSubGroups = false,
): TNavigationPlacement =>
  !hasSubGroups && (itemCount ?? 0) > NAVIGATION_INLINE_ITEM_LIMIT
    ? 'context'
    : 'inline';

export const countNavigationMenuItems = (root: HTMLElement) => {
  const menu = root.querySelector('[data-sidebar="menu"]');

  if (!menu) {
    return 0;
  }

  return Array.from(menu.querySelectorAll('[data-sidebar="menu-item"]')).filter(
    (item) => item.parentElement?.closest('[data-sidebar="menu"]') === menu,
  ).length;
};
