import { lazy, Suspense } from 'react';
import { Route, Routes, Navigate } from 'react-router';

import { ContactsPath } from '@/types/paths/ContactsPath';
import { ContactsPageEffect } from '@/contacts/components/ContactsPageEffect';

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

export const ContactsRoutes = () => {
  return (
    <Suspense fallback={<></>}>
      <Routes>
        <Route
          path="/"
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
      </Routes>
      <ContactsPageEffect />
    </Suspense>
  );
};
