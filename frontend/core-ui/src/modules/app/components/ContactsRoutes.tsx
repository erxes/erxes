import { lazy, Suspense } from 'react';
import { Route, Routes, Navigate } from 'react-router';

import { ContactsPath } from '@/types/paths/ContactsPath';
import { ContactsPageEffect } from '@/contacts/components/ContactsPageEffect';
import { NotFoundPage } from '~/pages/not-found/NotFoundPage';

const CustomersIndexPage = lazy(() =>
  import('~/pages/contacts/CustomersIndexPage').then((module) => ({
    default: module.CustomersIndexPage,
  })),
);

const CompaniesIndexPage = lazy(() =>
  import('~/pages/contacts/CompaniesIndexPage').then((module) => ({
    default: module.CompaniesIndexPage,
  })),
);

const ContactDetailPage = lazy(() =>
  import('~/pages/contacts/ContactDetailPage').then((module) => ({
    default: module.ContactDetailPage,
  })),
);

const ClientPortalUsersIndexPage = lazy(() =>
  import('~/pages/contacts/ClientPortalUsersIndexPage').then((module) => ({
    default: module.ClientPortalUsersIndexPage,
  })),
);

export const ContactsRoutes = () => {
  return (
    <Suspense fallback={<></>}>
      <Routes>
        <Route
          index
          element={
            <Navigate
              to={`${ContactsPath.Index}${ContactsPath.Customers}`}
              replace
            />
          }
        />
        <Route path={ContactsPath.Leads} element={<CustomersIndexPage />} />
        <Route path={ContactsPath.Customers} element={<CustomersIndexPage />} />
        <Route path={ContactsPath.Companies} element={<CompaniesIndexPage />} />
        <Route
          path={`${ContactsPath.Leads}/:id`}
          element={<ContactDetailPage contentType="core:customer" />}
        />
        <Route
          path={`${ContactsPath.Customers}/:id`}
          element={<ContactDetailPage contentType="core:customer" />}
        />
        <Route
          path={`${ContactsPath.Companies}/:id`}
          element={<ContactDetailPage contentType="core:company" />}
        />
        <Route
          path={ContactsPath.ClientPortalUsers}
          element={<ClientPortalUsersIndexPage />}
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <ContactsPageEffect />
    </Suspense>
  );
};
