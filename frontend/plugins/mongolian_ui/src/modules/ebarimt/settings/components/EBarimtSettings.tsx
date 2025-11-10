import { Filter, Spinner } from 'erxes-ui';
import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';
import { SettingsHeader } from 'ui-modules';
import { EBarimtSidebar } from './EBarimtSidebar';
import { EBarimtTopbar } from './EBarimtTopbar';
import { EBarimtBreadcrumb } from './EBarimtBreadcrumb';

export const EBarimtMainConfig = lazy(() =>
  import('~/pages/EBarimtSetting').then((module) => ({
    default: module.EBarimtSetting,
  })),
);

export const ReturnEBarimtConfig = lazy(() =>
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
              <Route path="/return" element={<ReturnEBarimtConfig />} />
              <Route
                path="/product-rules-on-tax"
                element={<AddProductRulesOnTaxPage />}
              />
            </Routes>
          </Suspense>
        </div>
      </div>
    </Filter>
  );
};

export default EBarimtSettings;
