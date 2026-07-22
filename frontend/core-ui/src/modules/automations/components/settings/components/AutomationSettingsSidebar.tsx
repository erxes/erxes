import { AutomationSettingsPath } from '@/types/paths/AutomationPath';
import { Button, cn, PageSubHeader, Sidebar } from 'erxes-ui';
import { Link, useLocation } from 'react-router';

const AUTOMATION_SETTINGS_NAV_ITEMS = [
  { label: 'Agents', path: AutomationSettingsPath.Agents },
  { label: 'Email Templates', path: AutomationSettingsPath.EmailTemplates },
  { label: 'Bots', path: AutomationSettingsPath.Bots },
];

export const AutomationSettingsSidebar = () => {
  const activePath = useLocation().pathname;

  return (
    <Sidebar collapsible="none" className="border-r flex-none max-md:hidden">
      <Sidebar.Group>
        <Sidebar.GroupContent>
          <Sidebar.Menu>
            {AUTOMATION_SETTINGS_NAV_ITEMS.map(({ label, path }) => (
              <Sidebar.MenuItem key={path}>
                <Sidebar.MenuButton
                  isActive={activePath.includes(path)}
                  asChild
                >
                  <Link to={path}>{label}</Link>
                </Sidebar.MenuButton>
              </Sidebar.MenuItem>
            ))}
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
    </Sidebar>
  );
};

export const AutomationSettingsMobileNav = () => {
  const activePath = useLocation().pathname;

  return (
    <PageSubHeader className="md:hidden overflow-x-auto">
      {AUTOMATION_SETTINGS_NAV_ITEMS.map(({ label, path }) => (
        <Button
          key={path}
          variant="ghost"
          asChild
          className={cn(
            'flex-none',
            activePath.includes(path) && 'bg-primary/10 text-primary',
          )}
        >
          <Link to={path}>{label}</Link>
        </Button>
      ))}
    </PageSubHeader>
  );
};
