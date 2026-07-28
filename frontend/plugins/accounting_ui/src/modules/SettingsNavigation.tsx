import { IconListDetails } from '@tabler/icons-react';
import { SettingsNavigationMenuLinkItem, Sidebar } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const SettingsNavigation = () => {
  const { t } = useTranslation('accounting');
  return (
    <Sidebar.Group>
      <Sidebar.GroupLabel className="h-4">{t('accounting')}</Sidebar.GroupLabel>
      <Sidebar.GroupContent className="pt-1">
        <Sidebar.Menu>
          <SettingsNavigationMenuLinkItem
            name={t('accounting')}
            icon={IconListDetails}
            path="/"
            pathPrefix="accounting/"
          />
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  );
};
