import { lazy } from 'react';

const WelcomeNotificationContent = lazy(() =>
  import('@/notification/components/contents/system/WelcomeMessage').then(
    (module) => ({
      default: module.WelcomeMessageContent,
    }),
  ),
);

const BranchNotificationContent = lazy(() =>
  import('@/notification/components/contents/structure/BranchNotificationContent').then(
    (module) => ({
      default: module.BranchNotificationContent,
    }),
  ),
);

const DepartmentNotificationContent = lazy(() =>
  import('@/notification/components/contents/structure/DepartmentNotificationContent').then(
    (module) => ({
      default: module.DepartmentNotificationContent,
    }),
  ),
);

const ExportNotificationContent = lazy(() =>
  import('@/notification/components/contents/import-export/export/components/ExportNotificationContent').then(
    (module) => ({
      default: module.ExportNotificationContent,
    }),
  ),
);

const ImportNotificationContent = lazy(() =>
  import('@/notification/components/contents/import-export/import/components/ImportNotificationContent').then(
    (module) => ({
      default: module.ImportNotificationContent,
    }),
  ),
);

export const CoreNotificationContent = {
  welcome: WelcomeNotificationContent,
  branch: BranchNotificationContent,
  department: DepartmentNotificationContent,
  exports: ExportNotificationContent,
  imports: ImportNotificationContent,
};
