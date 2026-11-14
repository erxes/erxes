import { IconChevronLeft } from '@tabler/icons-react';
import { AppLayout, NavigationMenuLinkItem, Sidebar } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { PageOutlet } from '~/components/CrashBoundary';

/**
 * An app's settings, as erxes plugins keep theirs (Sales, Frontline): the app sidebar's pinned
 * "Settings" link opens them in their own layout, whose sidebar lists only them, with
 * "Exit settings" back to the app. No group heading: the layout's title names the settings.
 */
export const AppSettingsLayout = ({
  id,
  title,
  exitTo,
  items,
}: {
  id: string;
  title: string;
  exitTo: string;
  items: { name: string; to: string; icon: React.ElementType }[];
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'sidebar' });

  const sidebar = (
    <>
      <Sidebar.Header variant="sticky">
        <Sidebar.Menu>
          <Sidebar.MenuItem>
            <Sidebar.MenuButton render={<Link to={exitTo} />}>
              <IconChevronLeft />
              <span>{t('exit-settings', 'Exit settings')}</span>
            </Sidebar.MenuButton>
          </Sidebar.MenuItem>
        </Sidebar.Menu>
      </Sidebar.Header>
      <Sidebar.Content>
        <Sidebar.Group>
          <Sidebar.GroupContent>
            <Sidebar.Menu>
              {items.map((item) => (
                <NavigationMenuLinkItem
                  key={item.to}
                  to={item.to}
                  name={item.name}
                  icon={item.icon}
                />
              ))}
            </Sidebar.Menu>
          </Sidebar.GroupContent>
        </Sidebar.Group>
      </Sidebar.Content>
    </>
  );

  return (
    <AppLayout id={id} title={title} sidebar={sidebar}>
      <PageOutlet />
    </AppLayout>
  );
};
