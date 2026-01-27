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

const ContractsPage = lazy(() =>
  import('~/pages/insurance/ContractsPage').then((module) => ({
    default: module.ContractsPage,
  })),
);

const ContractDetailPage = lazy(() =>
  import('~/pages/insurance/ContractDetailPage').then((module) => ({
    default: module.ContractDetailPage,
  })),
);

const CustomersPage = lazy(() =>
  import('~/pages/insurance/CustomersPage').then((module) => ({
    default: module.CustomersPage,
  })),
);

const CarInsurancePage = lazy(() =>
  import('~/pages/insurance/CarInsurancePage').then((module) => ({
    default: module.CarInsurancePage,
  })),
);

const CitizenInsurancePage = lazy(() =>
  import('~/pages/insurance/CitizenInsurancePage').then((module) => ({
    default: module.CitizenInsurancePage,
  })),
);

const ContractPdfEditorPage = lazy(() =>
  import('~/pages/insurance/ContractPdfEditorPage').then((module) => ({
    default: module.ContractPdfEditorPage,
  })),
);

const ContractTemplateEditorPage = lazy(() =>
  import('~/pages/insurance/ContractTemplateEditorPage').then((module) => ({
    default: module.ContractTemplateEditorPage,
  })),
);

const ContractTemplatesPage = lazy(() =>
  import('~/pages/insurance/ContractTemplatesPage').then((module) => ({
    default: module.default,
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
        <Route path="/contracts" element={<ContractsPage />} />
        <Route path="/contracts/:id" element={<ContractDetailPage />} />
        <Route path="/contracts/:id/pdf" element={<ContractPdfEditorPage />} />
        <Route path="/contract-templates" element={<ContractTemplatesPage />} />
        <Route
          path="/contract-templates/:id/edit"
          element={<ContractTemplateEditorPage />}
        />
        <Route
          path="/contract-templates/:id/preview"
          element={<ContractTemplateEditorPage />}
        />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/car-insurance" element={<CarInsurancePage />} />
        <Route path="/citizen-insurance" element={<CitizenInsurancePage />} />
      </Routes>
    </Suspense>
  );
};

export default insuranceMain;
