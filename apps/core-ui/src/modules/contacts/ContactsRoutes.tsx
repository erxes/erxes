import { Navigate, Route, Routes } from 'react-router-dom';
import { CompaniesPage } from './companies/CompaniesPage';
import { ContactDetailPage } from './components/ContactDetailPage';
import { ContactsLayout } from './ContactsLayout';
import { CustomersPage } from './customers/CustomersPage';

/**
 * Every Contacts route, mounted at `contacts/*`: the lists, and each record's
 * own page (where the side panel's expand button leads).
 */
export const ContactsRoutes = ({ notFound }: { notFound?: React.ReactNode }) => (
  <Routes>
    <Route element={<ContactsLayout />}>
      <Route index element={<Navigate to="customers" replace />} />
      <Route path="customers" element={<CustomersPage key="customer" state="customer" />} />
      <Route path="leads" element={<CustomersPage key="lead" state="lead" />} />
      <Route path="companies" element={<CompaniesPage />} />
      <Route path="customers/:id" element={<ContactDetailPage contentType="core:customer" />} />
      <Route path="leads/:id" element={<ContactDetailPage contentType="core:customer" />} />
      <Route path="companies/:id" element={<ContactDetailPage contentType="core:company" />} />
      {notFound && <Route path="*" element={notFound} />}
    </Route>
  </Routes>
);
