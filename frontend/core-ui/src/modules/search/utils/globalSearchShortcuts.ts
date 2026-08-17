import { isMacPlatform } from '@/navigation/utils/visitedPageTabShortcuts';
import { TGlobalSearchCategory } from '@/search/types/GlobalSearch';

interface IGlobalSearchShortcutEvent {
  altKey: boolean;
  code: string;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
}

const hasPrimaryModifier = ({
  ctrlKey,
  metaKey,
}: IGlobalSearchShortcutEvent) =>
  isMacPlatform() ? metaKey && !ctrlKey : ctrlKey && !metaKey;

export const isGlobalSearchOpenShortcut = (event: IGlobalSearchShortcutEvent) =>
  !event.shiftKey &&
  !event.altKey &&
  event.metaKey !== event.ctrlKey &&
  event.code === 'KeyM';

export const getGlobalSearchCategoryShortcut = (
  event: IGlobalSearchShortcutEvent,
  categories: TGlobalSearchCategory[],
  currentCategory: TGlobalSearchCategory,
): TGlobalSearchCategory | null => {
  if (event.altKey || event.shiftKey || !hasPrimaryModifier(event)) {
    return null;
  }

  if (
    categories.length < 2 ||
    (event.code !== 'ArrowLeft' && event.code !== 'ArrowRight')
  ) {
    return null;
  }

  const currentIndex = Math.max(categories.indexOf(currentCategory), 0);
  const direction = event.code === 'ArrowLeft' ? -1 : 1;
  const nextIndex =
    (currentIndex + direction + categories.length) % categories.length;

  return categories[nextIndex];
};
