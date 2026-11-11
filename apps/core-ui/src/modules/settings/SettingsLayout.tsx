import { IconAdjustmentsHorizontal, IconBuilding, IconTags, IconUsersGroup } from '@tabler/icons-react';
import { AppLayout } from 'erxes-ui';
import { Outlet } from 'react-router-dom';
import { AppNavigation } from '~/components/AppNavigation';

const SETTINGS_SECTIONS = [
  { name: 'Team members', path: 'team-members', icon: IconUsersGroup },
  { name: 'Tags', path: 'tags', icon: IconTags },
  { name: 'Properties', path: 'properties', icon: IconAdjustmentsHorizontal },
  { name: 'Organization', path: 'organization', icon: IconBuilding },
];

/** Organization settings (the gear in the top bar). */
export const SettingsLayout = () => (
  <AppLayout
    id="settings"
    title="Organization settings"
    sidebar={<AppNavigation label="Workspace" pathPrefix="settings" items={SETTINGS_SECTIONS} />}
  >
    <Outlet />
  </AppLayout>
);
