import {
  IconChevronLeft,
  IconFileImport,
  IconHierarchy2,
  IconProgress,
  IconTag,
} from '@tabler/icons-react';
import { AppLayout, NavigationMenuLinkItem, Sidebar } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link, Navigate, Route, Routes } from 'react-router-dom';
import { PageOutlet } from '~/components/CrashBoundary';
import { useCan } from '~/modules/auth/session';
import { CONTACT_PROPERTY_TYPES } from '~/modules/properties/constants';
import { ImportExportPage } from '~/modules/settings/import-export/ImportExportPage';
import { ImportWizardPage } from '~/modules/settings/import-export/ImportWizardPage';
import { LeadStagesPage } from '~/modules/settings/lead-stages/LeadStagesPage';
import { PropertiesSettingsRoutes } from '~/modules/settings/properties/PropertiesSettingsRoutes';
import { TagsSettingsPage } from '~/modules/settings/tags/TagsSettingsPage';
import { ContactsPath } from '../utils/contactDetailPath';
import { CONTACT_SETTINGS } from './paths';

/**
 * Contacts › Settings, as erxes plugins keep theirs (Sales, Frontline): the
 * app sidebar's pinned "Settings" link opens them in their own layout, whose
 * sidebar lists only them, with "Exit settings" back to the contacts.
 */
const ContactsSettingsSidebar = () => {
  const { t } = useTranslation('common', { keyPrefix: 'sidebar' });
  const can = useCan();

  const items = [
    { name: t('properties', 'Properties'), path: 'properties', icon: IconHierarchy2 },
    { name: t('tags', 'Tags'), path: 'tags', icon: IconTag },
    ...(can('properties.manage')
      ? [{ name: t('lead-stages', 'Lead stages'), path: 'lead-stages', icon: IconProgress }]
      : []),
    ...(can('contacts.import') || can('contacts.export')
      ? [
          {
            name: t('import-export', 'Import & export history'),
            path: 'import-export',
            icon: IconFileImport,
          },
        ]
      : []),
  ];

  return (
    <>
      <Sidebar.Header className="px-2 pt-0 pb-1">
        <Sidebar.Menu>
          <Sidebar.MenuItem>
            <Sidebar.MenuButton
              render={<Link to={`${ContactsPath.Index}${ContactsPath.Customers}`} />}
            >
              <IconChevronLeft />
              <span>{t('exit-settings', 'Exit settings')}</span>
            </Sidebar.MenuButton>
          </Sidebar.MenuItem>
        </Sidebar.Menu>
      </Sidebar.Header>
      <Sidebar.Content className="styled-scroll gap-1">
        {/* No heading: the sidebar's title already says "Contacts settings". */}
        <Sidebar.Group>
          <Sidebar.GroupContent>
            <Sidebar.Menu>
              {items.map((item) => (
                <NavigationMenuLinkItem
                  key={item.path}
                  pathPrefix="contacts/settings"
                  path={item.path}
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
};

const ContactsSettingsLayout = () => {
  const { t } = useTranslation('common', { keyPrefix: 'sidebar' });

  return (
    <AppLayout
      id="contacts-settings"
      title={t('contacts-settings', 'Contacts settings')}
      sidebar={<ContactsSettingsSidebar />}
    >
      <PageOutlet />
    </AppLayout>
  );
};

/** Everything under `/contacts/settings/*`. */
export const ContactsSettingsRoutes = () => (
  <Routes>
    <Route element={<ContactsSettingsLayout />}>
      <Route index element={<Navigate to="properties" replace />} />
      <Route
        path="properties/*"
        element={<PropertiesSettingsRoutes types={CONTACT_PROPERTY_TYPES} />}
      />
      <Route path="tags" element={<TagsSettingsPage />} />
      <Route path="lead-stages" element={<LeadStagesPage />} />
      <Route path="import-export" element={<ImportExportPage />} />
      <Route path="import-export/:id" element={<ImportWizardPage />} />
      {/* Absolute: a relative target resolves against the splat and appends to the address. */}
      <Route path="*" element={<Navigate to={CONTACT_SETTINGS.properties} replace />} />
    </Route>
  </Routes>
);
