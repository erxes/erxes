import { lazy, Suspense } from 'react';
import { Route, Routes, Navigate } from 'react-router';

import { ClientPortalPath } from '@/types/paths/ClientPortalPath';
import { Spinner } from 'erxes-ui';
import { ClientPortalLayout } from '@/client-portal/components/ClientPortalLayout';

const ClientPortalIndexPage = lazy(() =>
  import('~/pages/client-portal/ProductsIndexPage').then((module) => ({
    default: module.ClientPortalIndexPage,
  })),
);
const CreateWebsitePage = lazy(
  () => import('~/pages/client-portal/CreateWebsitePage'),
);
const ManageWebsitePage = lazy(
  () => import('~/pages/client-portal/ManageWebsitePage'),
);

export const ClientPortalRoutes = () => {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route element={<ClientPortalLayout />}>
          <Route
            path={ClientPortalPath.Index}
            element={<ClientPortalIndexPage />}
          />
          <Route
            path={ClientPortalPath.CreateWebsite}
            element={<CreateWebsitePage />}
          />
          <Route path={ClientPortalPath.Detail} element={<ManageWebsitePage />} />
        </Route>
      </Routes>
    </Suspense>
  );
};
