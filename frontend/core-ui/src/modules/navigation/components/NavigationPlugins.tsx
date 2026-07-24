import { usePluginsNavigationGroups } from '@/navigation/hooks/usePluginsNavigationGroups';
import { Sidebar } from 'erxes-ui';

export const NavigationPluginPanelContent = ({
  activityId,
}: {
  activityId: string;
}) => {
  const navigationGroups = usePluginsNavigationGroups();
  const navigationGroup = navigationGroups[activityId];

  if (!navigationGroup) {
    return null;
  }

  return (
    <>
      <Sidebar.Group className="px-2 py-1">
        <Sidebar.GroupContent>
          <Sidebar.Menu>
            {navigationGroup.contents.map((Content, index) => (
              <Content key={index} />
            ))}
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
      {navigationGroup.subGroups.map((SubGroup, index) => (
        <SubGroup key={index} />
      ))}
    </>
  );
};
