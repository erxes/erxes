import { Button, cn } from 'erxes-ui';

import { IconSearch } from '@tabler/icons-react';
import { NavigationRailLabel } from '@/navigation/components/navigation-activity-rail/NavigationRailLabel';
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
        'mb-1 h-8 shrink-0 justify-start gap-2 rounded border border-border/60 bg-background text-sm font-normal text-muted-foreground transition-[width,margin,padding,color,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-border hover:bg-background hover:text-foreground [&>svg]:size-4!',
        expanded ? 'w-full px-2.5' : 'ml-0.5 w-8 px-1.5',
      )}
      onClick={onSearch}
      size="default"
      title={t('search')}
      type="button"
      variant="ghost"
    >
      <IconSearch className="size-4 text-muted-foreground" />
      <NavigationRailLabel className="truncate" expanded={expanded}>
        {t('search')}
      </NavigationRailLabel>
    </Button>
  );
};
