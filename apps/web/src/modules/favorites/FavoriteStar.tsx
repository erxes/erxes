import { IconStar, IconStarFilled } from '@tabler/icons-react';
import { Button, Input, Popover } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CoreTabTooltip } from '~/modules/navigation/CoreTabTooltip';
import { useCurrentPath, useFavorites } from './useFavorites';

/** The page's own name: its header's breadcrumb, `Contacts / People`. */
const pageTitle = () =>
  Array.from(
    document.querySelectorAll('header nav[aria-label="breadcrumb"] li:not([role="presentation"])'),
    (crumb) => crumb.textContent.trim(),
  )
    .filter(Boolean)
    .join(' / ')
    .slice(0, 120);

/**
 * The top bar's star: stars the page on screen, with its view or open record,
 * and opens a box to name it or take the star off, as a browser's bookmark star does.
 */
export const FavoriteStar = ({ appLabel }: { appLabel?: string }) => {
  const { t } = useTranslation('common', { keyPrefix: 'favorites' });
  const path = useCurrentPath();
  const { favorites, add, rename, remove } = useFavorites();
  const current = favorites.find((favorite) => favorite.path === path);
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState('');
  const buttonLabel = current ? t('edit', 'Edit favorite') : t('add', 'Add to favorites');

  const start = () => {
    if (current) {
      setLabel(current.label);
    } else {
      const title = pageTitle() || appLabel || path;

      setLabel(title);
      add.mutate({ path, label: title });
    }

    setOpen(true);
  };

  const finish = () => {
    const next = label.trim();

    if (current && next && next !== current.label) rename.mutate({ id: current.id, label: next });

    setOpen(false);
  };

  // The home page has nothing of its own to star.
  if (path === '/' || path.startsWith('/?')) return null;

  return (
    <Popover open={open} onOpenChange={(next) => (next ? start() : finish())}>
      <CoreTabTooltip label={buttonLabel}>
        <Popover.Trigger
          render={
            <Button
              type="button"
              size="icon"
              variant="nav"
              aria-label={buttonLabel}
              aria-pressed={Boolean(current)}
              className="relative shrink-0"
            />
          }
        >
          {current ? (
            <IconStarFilled className="size-4 text-warning" />
          ) : (
            <IconStar className="size-4" />
          )}
        </Popover.Trigger>
      </CoreTabTooltip>
      <Popover.Content align="end" side="bottom" sideOffset={8} className="w-72">
        <FavoriteForm
          label={label}
          canRemove={Boolean(current)}
          onLabel={setLabel}
          onDone={finish}
          onRemove={() => {
            if (current) remove.mutate({ id: current.id });
            setOpen(false);
          }}
        />
      </Popover.Content>
    </Popover>
  );
};

/** The star's box: the favorite's name, Remove and Done. */
const FavoriteForm = ({
  label,
  canRemove,
  onLabel,
  onDone,
  onRemove,
}: {
  label: string;
  canRemove: boolean;
  onLabel: (label: string) => void;
  onDone: () => void;
  onRemove: () => void;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'favorites' });

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        onDone();
      }}
    >
      <p className="text-sm font-medium">{t('added', 'Added to favorites')}</p>
      <Input
        aria-label={t('name', 'Name')}
        maxLength={120}
        value={label}
        onChange={(event) => onLabel(event.target.value)}
      />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" size="sm" disabled={!canRemove} onClick={onRemove}>
          {t('remove', 'Remove')}
        </Button>
        <Button type="submit" size="sm">
          {t('done', 'Done')}
        </Button>
      </div>
    </form>
  );
};
