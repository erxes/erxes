import { IconSandbox } from '@tabler/icons-react';
import { NavigationMenuLinkItem } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const MainNavigation = () => {
  const { t } = useTranslation('mongolian');
  return (
    <>
      <NavigationMenuLinkItem
        name={t('put-response', 'Put Response')}
        path="mongolian/put-response"
        icon={IconSandbox}
      />
      <NavigationMenuLinkItem
        name={t('erkhet-sync', 'Erkhet Sync')}
        path="mongolian/sync-erkhet"
        icon={IconSandbox}
      />
      <NavigationMenuLinkItem
        name={t('ms-dynamic', 'MSDynamic')}
        path="mongolian/msdynamic"
        icon={IconSandbox}
      />
    </>
  );
};
