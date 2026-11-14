import { StructureSettingsBreadcrumb } from '@/settings/structure/components/StructureSettingsBreadcrumb';
import { StructureTopbar } from '@/settings/structure/components/StructureTopbar';
import { PageContainer, Spinner } from 'erxes-ui';
import { lazy, Suspense } from 'react';
import { Route, Routes, useMatch } from 'react-router-dom';
import { SettingsHeader } from 'ui-modules';

export const StructureMain = lazy(() =>
  import('@/settings/structure/components/Structure').then((module) => ({
    default: module.Structure,
  })),
);
export const BranchesSettings = lazy(() =>
  import('@/settings/structure/components/branches/BranchesSettings').then(
    (module) => ({
      default: module.BranchesSettings,
    }),
  ),
);
const BranchDetailPage = lazy(() =>
  import('./BranchDetailPage').then((module) => ({
    default: module.BranchDetailPage,
  })),
);
export const DepartmentsSettings = lazy(() =>
  import('@/settings/structure/components/departments/DepartmentSettings').then(
    (module) => ({
      default: module.DepartmentSettings,
    }),
  ),
);
export const UnitsSettings = lazy(() =>
  import('@/settings/structure/components/units/UnitsSettings').then(
    (module) => ({
      default: module.UnitsSettings,
    }),
  ),
);
export const PositionsSettings = lazy(() =>
  import('@/settings/structure/components/positions/PositionsSettings').then(
    (module) => ({
      default: module.PositionsSettings,
    }),
  ),
);

export function StructureSettingsPage() {
  const branchPage = useMatch('/settings/structures/branches/:branchId');
  return (
    <PageContainer>
      {!branchPage && (
        <SettingsHeader breadcrumbs={<StructureSettingsBreadcrumb />}>
          <StructureTopbar />
        </SettingsHeader>
      )}
      <div className="flex min-h-0 min-w-0 flex-auto w-full overflow-hidden">
        <Suspense
          fallback={
            <div className="flex justify-center items-center h-full">
              <Spinner />
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<StructureMain />} />
            <Route path="branches" element={<BranchesSettings />} />
            <Route path="branches/:branchId" element={<BranchDetailPage />} />
            <Route path="departments" element={<DepartmentsSettings />} />
            <Route path="units" element={<UnitsSettings />} />
            <Route path="positions" element={<PositionsSettings />} />
          </Routes>
        </Suspense>
      </div>
    </PageContainer>
  );
}
