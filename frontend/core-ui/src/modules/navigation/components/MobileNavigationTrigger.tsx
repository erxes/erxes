import { IconMenu2 } from '@tabler/icons-react';
import { Button, Separator, Sidebar } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const MobileNavigationTrigger = () => {
  const { isMobile, toggleSidebar } = Sidebar.useSidebar();
  const { t } = useTranslation('common', { keyPrefix: 'navigation' });

  if (!isMobile) {
    return null;
  }

  const label = t('toggle-panel');

  return (
    <div className="absolute top-0 left-0 z-30 flex h-13 w-10 items-center justify-center bg-sidebar pt-1">
      <Button
        aria-label={label}
        className="size-8 shrink-0"
        onClick={toggleSidebar}
        size="icon"
        title={label}
        type="button"
        variant="ghost"
      >
        <IconMenu2 className="size-4" />
      </Button>
      <Separator.Inline className="absolute top-1/2 right-0 -translate-y-1/2" />
    </div>
  );
};
