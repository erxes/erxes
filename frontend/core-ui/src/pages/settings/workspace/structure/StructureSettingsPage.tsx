import { StructureSettingsBreadcrumb } from '@/settings/structure/components/StructureSettingsBreadcrumb';
import { StructureSidebar } from '@/settings/structure/components/StructureSidebar';
import { StructureTopbar } from '@/settings/structure/components/StructureTopbar';
import { PageContainer, Spinner } from 'erxes-ui';
import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Permissions, SettingsHeader } from 'ui-modules';

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
  return (
    <PageContainer>
      <SettingsHeader breadcrumbs={<StructureSettingsBreadcrumb />}>
        <StructureTopbar />
      </SettingsHeader>
      <div className="flex flex-auto w-full overflow-hidden">
        <StructureSidebar />
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
            <Route path="departments" element={<DepartmentsSettings />} />
            <Route path="units" element={<UnitsSettings />} />
            <Route path="positions" element={<PositionsSettings />} />
            <Route
              path="permissions"
              element={<Permissions.View module="structures" />}
            />
          </Routes>
        </Suspense>
      </div>
    </PageContainer>
  );
}
