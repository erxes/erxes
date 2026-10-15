import { IconClipboard, IconUserFilled } from '@tabler/icons-react';
import { IconComponent, NavigationMenuLinkItem } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { currentUserState, usePermissionCheck } from 'ui-modules';
import { useGetTeams } from '@/team/hooks/useGetTeams';

export const MainNavigation = () => {
  const { t } = useTranslation('operation');
  const { isLoaded, hasModulePermission, isWildcard } = usePermissionCheck();
  const currentUser = useAtomValue(currentUserState);
  const { teams } = useGetTeams({
    variables: { userId: currentUser?._id },
    skip: !currentUser?._id,
  });

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
      {teams.map((team) => (
        <NavigationMenuLinkItem
          key={team._id}
          name={team.name ?? ''}
          pathPrefix="operation/team"
          path={team._id}
          label={
            <>
              <IconComponent
                name={team.icon ?? undefined}
                className="shrink-0 text-accent-foreground"
              />
              <span className="min-w-0 flex-1 truncate">{team.name}</span>
            </>
          }
        />
      ))}
    </>
  );
};
