import { IconClipboard, IconUserFilled } from '@tabler/icons-react';
import { NavigationMenuLinkItem } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { usePermissionCheck } from 'ui-modules';

export const MainNavigation = () => {
  const { t } = useTranslation('operation');
  const { isLoaded, hasModulePermission, isWildcard } = usePermissionCheck();

  const showProjects =
    !isLoaded || isWildcard || hasModulePermission('project');
  const showTasks = !isLoaded || isWildcard || hasModulePermission('task');

  return (
    <>
      {showProjects && (
        <NavigationMenuLinkItem
          name={t('projects')}
          icon={IconClipboard}
          pathPrefix="operation"
          path="projects"
        />
      )}
      {showTasks && (
        <NavigationMenuLinkItem
          name={t('my-tasks')}
          icon={IconUserFilled}
          pathPrefix="operation"
          path="tasks"
        />
      )}
    </>
  );
};
