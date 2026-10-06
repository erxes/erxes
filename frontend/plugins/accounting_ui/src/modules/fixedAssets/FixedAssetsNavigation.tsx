import { useTranslation } from 'react-i18next';
import { IconMoneybag, IconUserCheck } from '@tabler/icons-react';
import { NavigationMenuGroup, NavigationMenuLinkItem } from 'erxes-ui';

export const FixedAssetsNavigation = () => {
  const { t } = useTranslation('accounting');
  return (
    <NavigationMenuGroup name={t('fixed-asset')}>
      <NavigationMenuLinkItem
        name={t('asset-custodian')}
        icon={IconUserCheck}
        path="accounting/fixed-assets/owner-records"
      />
      <NavigationMenuLinkItem
        name={t('remainder')}
        icon={IconMoneybag}
        path="accounting/fixed-assets/remainders"
      />
    </NavigationMenuGroup>
  );
};
