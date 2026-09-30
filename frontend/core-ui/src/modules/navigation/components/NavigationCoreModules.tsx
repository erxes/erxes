import { INavigationActivity } from '@/navigation/types/NavigationActivity';
import { findActiveNavigationPath } from '@/navigation/utils/navigationPathMatch';
import { cn, Sidebar } from 'erxes-ui';
import { Link, useLocation } from 'react-router-dom';

export const NavigationCorePanelContent = ({
  activity,
}: {
  activity: INavigationActivity;
}) => {
  const location = useLocation();
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

            return (
              <Sidebar.MenuItem key={module.path}>
                <Sidebar.MenuButton
                  asChild
                  className="h-7 px-2 text-[13px]"
                  isActive={isActive}
                >
                  <Link to={`/${module.path.replace(/^\/+/, '')}`}>
                    {Icon && (
                      <Icon
                        className={cn(
                          'text-accent-foreground',
                          isActive && 'text-primary',
                        )}
                      />
                    )}
                    <span className="min-w-0 flex-1 truncate capitalize">
                      {module.name}
                    </span>
                  </Link>
                </Sidebar.MenuButton>
              </Sidebar.MenuItem>
            );
          })}
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  );
};
