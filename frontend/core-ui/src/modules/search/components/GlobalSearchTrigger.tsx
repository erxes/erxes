import { globalSearchOpenState } from '@/search/states/globalSearchState';
import { isMacPlatform } from '@/navigation/utils/visitedPageTabShortcuts';
import { IconSearch } from '@tabler/icons-react';
import { Button, cn } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';

export const GlobalSearchTrigger = ({ className }: { className?: string }) => {
  const { t } = useTranslation('common', { keyPrefix: 'global-search' });
  const setOpen = useSetAtom(globalSearchOpenState);
  const isMac = isMacPlatform();
  const label = t('placeholder', 'Search');

  return (
    <Button
      aria-keyshortcuts={isMac ? 'Meta+Alt+K' : 'Control+Alt+K'}
      aria-label={label}
      className={cn('size-8 shrink-0 text-muted-foreground', className)}
      onClick={() => setOpen(true)}
      size="icon"
      title={`${label} (${isMac ? '⌘ ⌥ K' : 'Ctrl Alt K'})`}
      type="button"
      variant="ghost"
    >
      <IconSearch className="size-4" />
    </Button>
  );
};
