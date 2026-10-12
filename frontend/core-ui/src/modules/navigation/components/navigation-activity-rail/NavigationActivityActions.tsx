import { Button, DropdownMenu, cn } from 'erxes-ui';
import {
  IconArrowDown,
  IconArrowUp,
  IconDots,
  IconExternalLink,
  IconPin,
  IconPinFilled,
  IconPinnedOff,
  IconStar,
  IconStarFilled,
  IconStarOff,
} from '@tabler/icons-react';
import { useRef, useState } from 'react';

import { TNavigationActivityMoveDirection } from '@/navigation/utils/navigationActivityOrder';
import { useOpenPathInNewVisitedPageTab } from '@/navigation/hooks/useOpenPathInNewVisitedPageTab';
import { useTranslation } from 'react-i18next';

const REVEAL_CLASSES = {
  activity:
    'group-hover/activity:pointer-events-auto group-hover/activity:opacity-100 group-has-[:focus-visible]/activity:pointer-events-auto group-has-[:focus-visible]/activity:opacity-100',
  'menu-item':
    'group-hover/menu-item:pointer-events-auto group-hover/menu-item:opacity-100 group-has-[:focus-visible]/menu-item:pointer-events-auto group-has-[:focus-visible]/menu-item:opacity-100',
} as const;

const actionButtonClassName =
  'size-6 shrink-0 text-muted-foreground transition-colors duration-150 hover:text-foreground';
const menuItemClassName = 'text-[13px] font-normal [&>svg]:size-3.5';

export const NavigationActivityActions = ({
  canMoveDown,
  canMoveUp,
  className,
  favorite,
  path,
  pinned,
  revealGroup = 'activity',
  onFavoriteChange,
  onMenuOpenChange,
  onMove,
  onPinnedChange,
}: Readonly<{
  canMoveDown: boolean;
  canMoveUp: boolean;
  className?: string;
  favorite?: boolean;
  path: string;
  pinned?: boolean;
  revealGroup?: keyof typeof REVEAL_CLASSES;
  onFavoriteChange?: () => void;
  onMenuOpenChange?: (open: boolean, element: HTMLElement | null) => void;
  onMove: (direction: TNavigationActivityMoveDirection) => void;
  onPinnedChange?: (pinned: boolean) => void;
}>) => {
  const { t } = useTranslation('common', { keyPrefix: 'navigation' });
  const [menuOpen, setMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const openInNewTab = useOpenPathInNewVisitedPageTab();
  const hasFavorite = favorite !== undefined && Boolean(onFavoriteChange);
  const hasPin = pinned !== undefined && Boolean(onPinnedChange);
  const pinLabel = pinned ? t('unpin', 'Unpin') : t('pin', 'Pin');
  const favoriteLabel = favorite
    ? t('remove-from-favorites', 'Remove from favorites')
    : t('add-to-favorites', 'Add to favorites');
  const stopRowClick = (event: React.SyntheticEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div
      ref={containerRef}
      data-nav-actions
      className={cn(
        'pointer-events-none absolute top-0 flex h-7 items-center gap-0.5 opacity-0 transition-opacity duration-150 ease-out motion-reduce:transition-none',
        REVEAL_CLASSES[revealGroup],
        menuOpen && 'pointer-events-auto opacity-100',
        className,
      )}
    >
      {hasPin && (
        <Button
          aria-label={pinLabel}
          className={cn(actionButtonClassName, pinned && 'text-primary')}
          size="icon"
          type="button"
          variant="ghost"
          onClick={(event) => {
            stopRowClick(event);
            onPinnedChange?.(!pinned);
          }}
        >
          {pinned ? (
            <IconPinFilled className="size-3.5" />
          ) : (
            <IconPin className="size-3.5" />
          )}
        </Button>
      )}
      {hasFavorite && (
        <Button
          aria-label={favoriteLabel}
          className={cn(
            actionButtonClassName,
            'text-yellow-500 hover:bg-yellow-500/10 hover:text-yellow-500',
          )}
          size="icon"
          type="button"
          variant="ghost"
          onClick={(event) => {
            stopRowClick(event);
            onFavoriteChange?.();
          }}
        >
          {favorite ? (
            <IconStarFilled className="size-3.5" />
          ) : (
            <IconStar className="size-3.5" />
          )}
        </Button>
      )}
      <DropdownMenu
        open={menuOpen}
        onOpenChange={(open) => {
          setMenuOpen(open);
          onMenuOpenChange?.(open, containerRef.current);
        }}
      >
        <DropdownMenu.Trigger asChild>
          <Button
            aria-label={t('more-actions', 'More actions')}
            className={actionButtonClassName}
            size="icon"
            type="button"
            variant="ghost"
            onClick={stopRowClick}
          >
            <IconDots className="size-4" />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content
          align="start"
          className="min-w-52"
          side="right"
          sideOffset={8}
          onClick={stopRowClick}
        >
          {hasFavorite && (
            <DropdownMenu.Item
              className={menuItemClassName}
              onSelect={() => onFavoriteChange?.()}
            >
              {favorite ? <IconStarOff /> : <IconStar />}
              {favoriteLabel}
            </DropdownMenu.Item>
          )}
          {hasPin && (
            <DropdownMenu.Item
              className={menuItemClassName}
              onSelect={() => onPinnedChange?.(!pinned)}
            >
              {pinned ? <IconPinnedOff /> : <IconPin />}
              {pinLabel}
            </DropdownMenu.Item>
          )}
          <DropdownMenu.Item
            className={menuItemClassName}
            onSelect={() => openInNewTab(path)}
          >
            <IconExternalLink />
            {t('open-in-new-tab', 'New tab')}
          </DropdownMenu.Item>
          <DropdownMenu.Separator />
          <DropdownMenu.Item
            className={menuItemClassName}
            disabled={!canMoveUp}
            onSelect={() => onMove('up')}
          >
            <IconArrowUp />
            {t('move-up', 'Move up in sidebar')}
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className={menuItemClassName}
            disabled={!canMoveDown}
            onSelect={() => onMove('down')}
          >
            <IconArrowDown />
            {t('move-down', 'Move down in sidebar')}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>
    </div>
  );
};
