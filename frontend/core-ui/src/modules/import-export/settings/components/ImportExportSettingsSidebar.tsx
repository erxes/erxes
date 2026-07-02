import { Sidebar } from 'erxes-ui';
import { Link, useLocation } from 'react-router-dom';
import { ImportExportSettingsPath } from '@/import-export/settings/constants/importExportSettingsPaths';
import { useTranslation } from 'react-i18next';

export const ImportExportSettingsSidebar = () => {
  const { t } = useTranslation('import-export');
  return (
    <Sidebar collapsible="none" className="flex-none border-r">
      <Sidebar.Group>
        <Sidebar.GroupContent>
          <Sidebar.Menu>
            <ImportExportSidebarItem to={ImportExportSettingsPath.Import}>
              {t('import', 'Import')}
            </ImportExportSidebarItem>
            <ImportExportSidebarItem to={ImportExportSettingsPath.Export}>
              {t('export', 'Export')}
            </ImportExportSidebarItem>
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
    </Sidebar>
  );
};

const ImportExportSidebarItem = ({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) => {
  const isActive = useLocation().pathname === to;

  return (
    <Sidebar.MenuItem>
      <Sidebar.MenuButton asChild isActive={isActive}>
        <Link to={to}>{children}</Link>
      </Sidebar.MenuButton>
    </Sidebar.MenuItem>
  );
};
