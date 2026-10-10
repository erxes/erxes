import { Link, useLocation } from 'react-router-dom';
import { Sidebar, useNavigationMenuItemControls } from 'erxes-ui';

import { INavigationActivity } from '@/navigation/types/NavigationActivity';
import { findActiveNavigationPath } from '@/navigation/utils/navigationPathMatch';

export const NavigationCorePanelContent = ({
  activity,
}: {
  activity: INavigationActivity;
}) => {
  const location = useLocation();
  const controls = useNavigationMenuItemControls();
  const modules = activity.modules.flatMap((module) =>
    module.submenus?.length ? module.submenus : [module],
  );
  const activePath = findActiveNavigationPath(
    modules.map((module) => module.path),
    location,
  );

  return (
    <Sidebar.Group className="px-2 py-1">
      <Sidebar.GroupContent>
        <Sidebar.Menu>
          {modules.map((module) => {
            const isActive = module.path === activePath;
            const Icon = module.icon;
            const fullPath = `/${module.path.replace(/^\/+/, '')}`;
            const order = controls?.getOrder(fullPath);

            return (
              <Sidebar.MenuItem
                key={module.path}
                data-nav-path={controls ? fullPath : undefined}
                style={order === undefined ? undefined : { order }}
              >
                <Sidebar.MenuButton
                  asChild
                  className="px-2"
                  isActive={isActive}
                >
                  <Link to={fullPath}>
                    {Icon && <Icon />}
                    <span className="min-w-0 flex-1 truncate capitalize">
                      {module.name}
                    </span>
                  </Link>
                </Sidebar.MenuButton>
                {controls?.renderActions({
                  name: module.name,
                  path: fullPath,
                  icon: Icon,
                })}
              </Sidebar.MenuItem>
            );
          })}
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  );
};
