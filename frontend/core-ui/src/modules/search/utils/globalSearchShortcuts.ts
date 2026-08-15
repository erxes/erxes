import { isMacPlatform } from '@/navigation/utils/visitedPageTabShortcuts';
import { TGlobalSearchCategory } from '@/search/types/GlobalSearch';

interface IGlobalSearchShortcutEvent {
  altKey: boolean;
  code: string;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
}

const hasPrimaryModifier = ({ ctrlKey, metaKey }: IGlobalSearchShortcutEvent) =>
  isMacPlatform() ? metaKey && !ctrlKey : ctrlKey && !metaKey;

export const isGlobalSearchOpenShortcut = (event: IGlobalSearchShortcutEvent) =>
  !event.shiftKey &&
  !event.altKey &&
  event.metaKey !== event.ctrlKey &&
  event.code === 'KeyM';

export const getGlobalSearchCategoryShortcut = (
  event: IGlobalSearchShortcutEvent,
  categories: TGlobalSearchCategory[],
): TGlobalSearchCategory | null => {
  if (event.altKey || event.shiftKey || !hasPrimaryModifier(event)) {
    return null;
  }

  if (!/^Digit[1-9]$/.test(event.code)) {
    return null;
  }

  const index = Number(event.code.slice(-1)) - 1;

  return categories[index] ?? null;
};
