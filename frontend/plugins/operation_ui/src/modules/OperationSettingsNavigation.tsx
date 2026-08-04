import { useTranslation } from 'react-i18next';
import { OperationPaths } from '~/types/paths';
import { SettingsNavigationMenuLinkItem, Sidebar } from 'erxes-ui';

export const OperationSettingsNavigation = () => {
  const { t } = useTranslation('operation');
  return (
    <Sidebar.Group>
      <Sidebar.GroupLabel className="h-4">{t('operation')}</Sidebar.GroupLabel>
      <Sidebar.GroupContent className="pt-1">
        <Sidebar.Menu>
          <SettingsNavigationMenuLinkItem
            pathPrefix={OperationPaths.Operation}
            path={OperationPaths.TeamList}
            name={t('teams')}
          />
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  );
};
