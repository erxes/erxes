import { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { EBarimtSidebar } from '@/ebarimt/settings/components/EBarimtSidebar';
import { EBarimtBreadcrumb } from '@/ebarimt/settings/components/EBarimtBreadcrumb';
import { SettingsLayout } from '~/modules/SettingsLayout';

export const EBarimtMainConfig = lazy(() =>
  import('~/pages/EBarimtSetting').then((m) => ({
    default: m.EBarimtSetting,
  })),
);

export const ReturnEbarimtConfig = lazy(() =>
  import('~/pages/ReturnEBarimtConfigPage').then((m) => ({
    default: m.ReturnEBarimtConfig,
  })),
);

export const AddProductRulesOnTaxPage = lazy(() =>
  import('~/pages/ProductRulesOnTaxPage').then((m) => ({
    default: m.ProductRulesOnTaxPage,
  })),
);

export const StageInEBarimtConfig = lazy(() =>
  import('~/pages/StageInEBarimtConfigPage').then((m) => ({
    default: m.StageInEBarimtConfig,
  })),
);

export const ProductGroupPage = lazy(() =>
  import('~/pages/ProductGroupPage').then((m) => ({
    default: m.ProductGroupPage,
  })),
);

const EBarimtSettings = () => {
  return (
    <SettingsLayout
      sidebar={<EBarimtSidebar />}
      breadcrumbs={<EBarimtBreadcrumb />}
    >
      <Routes>
        <Route index element={<EBarimtMainConfig />} />
        <Route path="stage-in" element={<StageInEBarimtConfig />} />
        <Route path="return" element={<ReturnEbarimtConfig />} />
        <Route
          path="product-rules-on-tax"
          element={<AddProductRulesOnTaxPage />}
        />
        <Route path="product-groups" element={<ProductGroupPage />} />
      </Routes>
    </SettingsLayout>
  );
};

export default EBarimtSettings;
