import { IconBrandGithub, IconUsersGroup } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { OperationPaths } from '~/types/paths';
import { NavigationMenuLinkItem, Sidebar } from 'erxes-ui';

export const OperationSettingsNavigation = () => {
  const { t } = useTranslation('operation');
  return (
    <Sidebar.Group>
      <Sidebar.GroupContent className="pt-1">
        <Sidebar.Menu>
          <NavigationMenuLinkItem
            pathPrefix="operation/settings"
            path={OperationPaths.TeamList}
            name={t('teams')}
            icon={IconUsersGroup}
          />
          <NavigationMenuLinkItem
            pathPrefix="operation/settings"
            path={OperationPaths.GithubIntegration}
            name="GitHub Integration"
            icon={IconBrandGithub}
          />
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  );
};
