import { Navigate, Route, Routes } from 'react-router-dom';
import { ContactsSettingsRoutes } from './settings/ContactsSettingsRoutes';
import { CompaniesPage } from './companies/CompaniesPage';
import { ContactsLayout } from './ContactsLayout';
import { CustomersPage } from './customers/CustomersPage';
import { LeadsReportPage } from '~/modules/reports/ReportsRoutes';
import { RecordPage } from '~/modules/side-panel/RecordPage';

/**
 * Every Contacts route, mounted at `contacts/*`: the lists, and each record's
 * own page (where the side panel's expand button leads).
 */
export const ContactsRoutes = ({ notFound }: { notFound?: React.ReactNode }) => (
  <Routes>
    <Route element={<ContactsLayout />}>
      <Route index element={<Navigate to="customers" replace />} />
      <Route path="customers" element={<CustomersPage key="customer" state="customer" />} />
      {/* Leads: Insights, People, Companies (the sidebar's Leads group). */}
      <Route path="leads" element={<CustomersPage key="lead" state="lead" />} />
      <Route path="leads/companies" element={<CompaniesPage key="company-lead" state="lead" />} />
      <Route path="leads/insights" element={<LeadsReportPage inContacts />} />
      <Route path="companies" element={<CompaniesPage />} />
      <Route path="customers/:id" element={<RecordPage contentType="core:customer" />} />
      <Route path="leads/:id" element={<RecordPage contentType="core:customer" />} />
      <Route path="companies/:id" element={<RecordPage contentType="core:company" />} />
      {notFound && <Route path="*" element={notFound} />}
    </Route>
    {/* Its own layout, like a plugin's settings: the contacts sidebar gives way to the settings list. */}
    <Route path="settings/*" element={<ContactsSettingsRoutes />} />
  </Routes>
);
