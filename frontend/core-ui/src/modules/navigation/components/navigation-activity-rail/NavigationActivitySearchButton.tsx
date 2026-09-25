import { NavigationRailLabel } from '@/navigation/components/NavigationRailLabel';
import { IconSearch } from '@tabler/icons-react';
import { Button, cn } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const NavigationActivitySearchButton = ({
  expanded,
  onSearch,
}: Readonly<{
  expanded: boolean;
  onSearch: () => void;
}>) => {
  const { t } = useTranslation('common', { keyPrefix: 'navigation' });

  return (
    <Button
      aria-label={t('search')}
      aria-keyshortcuts="Control+M Meta+M"
      className={cn(
        'mb-1 h-7 shrink-0 justify-start gap-2 rounded-md text-sm transition-[width,margin,padding] duration-200 ease-linear [&>svg]:size-4!',
        expanded ? 'w-full px-2' : 'ml-0.5 w-7 px-1.5',
      )}
      onClick={onSearch}
      size="default"
      title={t('search')}
      type="button"
      variant="ghost"
    >
      <IconSearch className="size-4 text-accent-foreground" />
      <NavigationRailLabel className="truncate font-medium" expanded={expanded}>
        {t('search')}
      </NavigationRailLabel>
    </Button>
  );
};
