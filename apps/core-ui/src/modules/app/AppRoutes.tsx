import { Spinner } from 'erxes-ui';
import { Navigate, Route, Routes } from 'react-router-dom';
import { CompaniesPage } from '~/modules/contacts/companies/CompaniesPage';
import { ContactsLayout } from '~/modules/contacts/ContactsLayout';
import { CustomersPage } from '~/modules/contacts/customers/CustomersPage';
import { PluginPage } from '~/modules/plugins/PluginPage';
import { usePlugins } from '~/modules/plugins/usePlugins';
import { OrganizationPage } from '~/modules/settings/organization/OrganizationPage';
import { PropertiesPage } from '~/modules/settings/properties/PropertiesPage';
import { SettingsLayout } from '~/modules/settings/SettingsLayout';
import { TagsSettingsPage } from '~/modules/settings/tags/TagsSettingsPage';
import { TeamMembersPage } from '~/modules/settings/team-members/TeamMembersPage';
import { MainLayout } from './MainLayout';
import { NotFoundPage } from './NotFoundPage';

/** Plugin pages mount at `/<CONFIG.path>/*` once their config has loaded. */
const PluginRoutes = () => {
  const { plugins, loading } = usePlugins();

  return (
    <Routes>
      {plugins.map((plugin) => (
        <Route
          key={plugin.remote}
          path={`/${plugin.config.path.replace(/^\/+|\/+$/g, '')}/*`}
          element={<PluginPage key={plugin.remote} plugin={plugin} />}
        />
      ))}
      <Route
        path="*"
        element={
          loading ? (
            <div className="flex h-full items-center justify-center">
              <Spinner />
            </div>
          ) : (
            <NotFoundPage />
          )
        }
      />
    </Routes>
  );
};

export const AppRoutes = () => (
  <Routes>
    <Route element={<MainLayout />}>
      <Route index element={<Navigate to="/contacts/customers" replace />} />
      <Route path="contacts" element={<ContactsLayout />}>
        <Route index element={<Navigate to="customers" replace />} />
        <Route path="customers" element={<CustomersPage key="customer" state="customer" />} />
        <Route path="leads" element={<CustomersPage key="lead" state="lead" />} />
        <Route path="companies" element={<CompaniesPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      <Route path="settings" element={<SettingsLayout />}>
        <Route index element={<Navigate to="team-members" replace />} />
        <Route path="team-members" element={<TeamMembersPage />} />
        <Route path="tags" element={<TagsSettingsPage />} />
        <Route path="properties" element={<PropertiesPage />} />
        <Route path="organization" element={<OrganizationPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      <Route path="*" element={<PluginRoutes />} />
    </Route>
  </Routes>
);
