import { IconLifebuoy } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useSupportAccessBanner } from '@/settings/support-access/hooks/useSupportAccessBanner';
import { SUPPORT_ACCESS_PATH } from '@/settings/support-access/utils';

/** Tells owners, and the support user, that erxes support is in the workspace. */
export const SupportAccessBanner = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'support-access' });
  const banner = useSupportAccessBanner();

  if (!banner) return null;

  return (
    <div className="flex items-center gap-2 bg-warning/10 px-4 py-1.5 text-sm text-warning">
      <IconLifebuoy className="size-4 shrink-0" />
      <span className="min-w-0 flex-1 truncate">
        {t(banner.messageKey, banner.values)}
      </span>
      {banner.canManage && (
        <Button asChild variant="link" size="sm" className="h-auto p-0">
          <Link to={SUPPORT_ACCESS_PATH}>{t('manage')}</Link>
        </Button>
      )}
    </div>
  );
};
