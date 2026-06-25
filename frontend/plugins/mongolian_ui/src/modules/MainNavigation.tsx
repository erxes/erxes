import { IconSandbox } from '@tabler/icons-react';
import { NavigationMenuLinkItem } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const MainNavigation = () => {
  const { t } = useTranslation('mongolian');
  return (
    <>
      <NavigationMenuLinkItem
        name={t('put-response')}
        path="mongolian/put-response"
        icon={IconSandbox}
      />
      <NavigationMenuLinkItem
        name={t('erkhet-sync')}
        path="mongolian/sync-erkhet"
        icon={IconSandbox}
      />
      <NavigationMenuLinkItem
        name={t('ms-dynamic')}
        path="mongolian/msdynamic"
        icon={IconSandbox}
      />
    </>
  );
};
