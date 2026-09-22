import { INavigationActivity } from '@/navigation/types/NavigationActivity';
import { NavigationMenuLinkItem, Sidebar } from 'erxes-ui';

export const NavigationCorePanelContent = ({
  activity,
}: {
  activity: INavigationActivity;
}) => {
  const modules = activity.modules.flatMap((module) =>
    module.submenus?.length ? module.submenus : [module],
  );

  return (
    <Sidebar.Group className="px-2 py-1">
      <Sidebar.GroupContent>
        <Sidebar.Menu>
          {modules.map((module) => (
            <NavigationMenuLinkItem
              key={module.path}
              name={module.name}
              icon={module.icon}
              path={module.path}
              className="h-7 px-2 text-[13px]"
            />
          ))}
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  );
};
