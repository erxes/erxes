import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';

const IndexPage = lazy(() =>
  import('~/pages/insurance/IndexPage').then((module) => ({
    default: module.IndexPage,
  })),
);

const VendorsPage = lazy(() =>
  import('~/pages/insurance/VendorsPage').then((module) => ({
    default: module.VendorsPage,
  })),
);

const ProductsPage = lazy(() =>
  import('~/pages/insurance/ProductsPage').then((module) => ({
    default: module.ProductsPage,
  })),
);

const RiskTypesPage = lazy(() =>
  import('~/pages/insurance/RiskTypesPage').then((module) => ({
    default: module.RiskTypesPage,
  })),
);

const InsuranceTypesPage = lazy(() =>
  import('~/pages/insurance/InsuranceTypesPage').then((module) => ({
    default: module.InsuranceTypesPage,
  })),
);

const VendorDetailPage = lazy(() =>
  import('~/pages/insurance/VendorDetailPage').then((module) => ({
    default: module.VendorDetailPage,
  })),
);

const VendorUsersPage = lazy(() =>
  import('~/pages/insurance/VendorUsersPage').then((module) => ({
    default: module.VendorUsersPage,
  })),
);

const insuranceMain = () => {
  return (
    <Suspense fallback={<div />}>
      <Routes>
        <Route path="/" element={<IndexPage />} />
        <Route path="/vendors" element={<VendorsPage />} />
        <Route path="/vendors/:id" element={<VendorDetailPage />} />
        <Route path="/vendor-users" element={<VendorUsersPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/risks" element={<RiskTypesPage />} />
        <Route path="/types" element={<InsuranceTypesPage />} />
      </Routes>
    </Suspense>
  );
};

export default insuranceMain;
