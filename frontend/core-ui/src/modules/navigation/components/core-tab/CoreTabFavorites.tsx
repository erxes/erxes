import { Button, Popover } from 'erxes-ui';
import { IconStar, IconStarFilled } from '@tabler/icons-react';

import { Link } from 'react-router-dom';
import { useFavorites } from '@/navigation/hooks/useFavorites';
import { useNavigationFavorite } from '@/navigation/hooks/useNavigationFavorite';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const CoreTabFavoriteItem = ({
  breadcrumb,
  icon: Icon,
  name,
  path,
  onNavigate,
}: Readonly<{
  breadcrumb: string[];
  icon?: React.ElementType;
  name: string;
  path: string;
  onNavigate: () => void;
}>) => {
  const { t } = useTranslation('common', { keyPrefix: 'navigation' });
  const { toggleFavorite } = useNavigationFavorite({ breadcrumb, path });
  const label = breadcrumb.length > 1 ? breadcrumb.slice(1).join(' / ') : name;

  return (
    <div className="group/favorite flex h-8 items-center rounded hover:bg-accent">
      <Link
        className="flex h-8 min-w-0 flex-1 items-center gap-2 px-2 text-sm font-medium"
        to={`/${path.replace('_ui', '').replace(/^\/+/, '')}`}
        onClick={onNavigate}
      >
        {Icon && <Icon className="size-4 shrink-0" />}
        <span className="truncate">{label}</span>
        {breadcrumb.length > 1 && (
          <span className="ml-auto shrink-0 truncate text-xs text-muted-foreground">
            {breadcrumb[0]}
          </span>
        )}
      </Link>
      <Button
        aria-label={t('remove-from-favorites', 'Remove from favorites')}
        className="mr-1 size-6 text-yellow-500 hover:bg-yellow-500/10 hover:text-yellow-500"
        size="icon"
        type="button"
        variant="ghost"
        onClick={toggleFavorite}
      >
        <IconStarFilled className="size-3.5" />
      </Button>
    </div>
  );
};

export const CoreTabFavorites = () => {
  const [open, setOpen] = useState(false);
  const favorites = useFavorites();
  const { t } = useTranslation('common', { keyPrefix: 'sidebar' });

  if (favorites.length === 0) {
    return null;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button
          aria-label={t('favorites')}
          className="size-7 shrink-0"
          size="icon"
          title={t('favorites')}
          type="button"
          variant="ghost"
        >
          <IconStar className="size-4" />
        </Button>
      </Popover.Trigger>
      <Popover.Content
        align="end"
        className="flex w-72 flex-col gap-0.5 rounded-xl border-border/60 p-1.5 shadow-lg"
        sideOffset={8}
      >
        <h2 className="flex h-7 items-center px-2 font-sans text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {t('favorites')}
        </h2>
        {favorites.map((item) => (
          <CoreTabFavoriteItem
            key={item.path}
            {...item}
            onNavigate={() => setOpen(false)}
          />
        ))}
      </Popover.Content>
    </Popover>
  );
};
