import { Navigate, Route, Routes } from 'react-router-dom';
import { CompaniesPage } from './companies/CompaniesPage';
import { ContactDetailPage } from './components/ContactDetailPage';
import { ContactsLayout } from './ContactsLayout';
import { CustomersPage } from './customers/CustomersPage';
import { useLeadKind } from '~/modules/leads/LeadViewSwitch';

/** Leads: people (`?kind=` absent) or companies (`?kind=companies`), same screens. */
const LeadsPage = () =>
  useLeadKind() === 'company' ? <CompaniesPage key="company-lead" state="lead" /> : <CustomersPage key="lead" state="lead" />;

/**
 * Every Contacts route, mounted at `contacts/*`: the lists, and each record's
 * own page (where the side panel's expand button leads).
 */
export const ContactsRoutes = ({ notFound }: { notFound?: React.ReactNode }) => (
  <Routes>
    <Route element={<ContactsLayout />}>
      <Route index element={<Navigate to="customers" replace />} />
      <Route path="customers" element={<CustomersPage key="customer" state="customer" />} />
      <Route path="leads" element={<LeadsPage />} />
      {/* Lead insights moved to the Reports app. */}
      <Route path="leads/insights" element={<Navigate to="/reports/leads" replace />} />
      <Route path="companies" element={<CompaniesPage />} />
      <Route path="customers/:id" element={<ContactDetailPage contentType="core:customer" />} />
      <Route path="leads/:id" element={<ContactDetailPage contentType="core:customer" />} />
      <Route path="companies/:id" element={<ContactDetailPage contentType="core:company" />} />
      {notFound && <Route path="*" element={notFound} />}
    </Route>
  </Routes>
);
