import { Filter, Spinner } from 'erxes-ui';
import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';
import { SettingsHeader } from 'ui-modules';
import { EBarimtSidebar } from '@/ebarimt/settings/components/EBarimtSidebar';
import { EBarimtTopbar } from '@/ebarimt/settings/components/EBarimtTopbar';
import { EBarimtBreadcrumb } from '@/ebarimt/settings/components/EBarimtBreadcrumb';

export const EBarimtMainConfig = lazy(() =>
  import('~/pages/EBarimtSetting').then((module) => ({
    default: module.EBarimtSetting,
  })),
);

export const ReturnEbarimtConfig = lazy(() =>
  import('~/pages/ReturnEBarimtConfigPage').then((module) => ({
    default: module.ReturnEBarimtConfig,
  })),
);
export const AddProductRulesOnTaxPage = lazy(() =>
  import('~/pages/ProductRulesOnTaxPage').then((module) => ({
    default: module.ProductRulesOnTaxPage,
  })),
);
export const StageInEBarimtConfig = lazy(() =>
  import('~/pages/StageInEBarimtConfigPage').then((module) => ({
    default: module.StageInEBarimtConfig,
  })),
);
export const ProductGroupPage = lazy(() =>
  import('~/pages/ProductGroupPage').then((module) => ({
    default: module.ProductGroupPage,
  })),
);
const EBarimtSettings = () => {
  return (
    <Filter id="ebarimt-settings">
      <div className="flex flex-col flex-auto overflow-hidden">
        <SettingsHeader breadcrumbs={<EBarimtBreadcrumb />}>
          <div className="flex ml-auto">
            <EBarimtTopbar />
          </div>
        </SettingsHeader>
        <div className="flex flex-auto overflow-hidden">
          <EBarimtSidebar />
          <Suspense
            fallback={
              <div className="flex justify-center items-center h-full">
                <Spinner />
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<EBarimtMainConfig />} />
              <Route path="/stage-in" element={<StageInEBarimtConfig />} />
              <Route path="/return" element={<ReturnEbarimtConfig />} />
              <Route
                path="/product-rules-on-tax"
                element={<AddProductRulesOnTaxPage />}
              />
              <Route path="/product-groups" element={<ProductGroupPage />} />
            </Routes>
          </Suspense>
        </div>
      </div>
    </Filter>
  );
};

export default EBarimtSettings;
