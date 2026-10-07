import { PageContainer, Spinner } from 'erxes-ui';
import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

const StructureChart = lazy(() =>
  import('@/settings/structure/components/chart/StructureChartPage').then(
    (module) => ({ default: module.StructureChartPage }),
  ),
);

const LegacyStructureRedirect = ({ view }: { view: string }) => {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  params.set('view', view);
  return (
    <Navigate
      to={{ pathname: '/settings/structures', search: `?${params}` }}
      replace
    />
  );
};

export function StructureSettingsPage() {
  return (
    <PageContainer>
      <div className="flex flex-col flex-auto w-full overflow-hidden">
        <Suspense
          fallback={
            <div className="flex justify-center items-center h-full">
              <Spinner />
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<StructureChart />} />
            <Route
              path="branches"
              element={<LegacyStructureRedirect view="branches" />}
            />
            <Route
              path="departments"
              element={<LegacyStructureRedirect view="departments" />}
            />
            <Route
              path="positions"
              element={<LegacyStructureRedirect view="positions" />}
            />
            <Route
              path="units"
              element={<LegacyStructureRedirect view="departments" />}
            />
            <Route
              path="*"
              element={<LegacyStructureRedirect view="departments" />}
            />
          </Routes>
        </Suspense>
      </div>
    </PageContainer>
  );
}
