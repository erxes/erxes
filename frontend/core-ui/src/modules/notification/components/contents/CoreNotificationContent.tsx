import { lazy } from 'react';

const WelcomeNotificationContent = lazy(() =>
  import('@/notification/components/contents/system/WelcomeMessage').then(
    (module) => ({
      default: module.WelcomeMessageContent,
    }),
  ),
);

const StructureEntityNotificationContent = lazy(() =>
  import(
    '@/notification/components/contents/structure/StructureEntityNotificationContent'
  ).then((module) => ({
    default: module.StructureEntityNotificationContent,
  })),
);

const StructureSeatNotificationContent = lazy(() =>
  import(
    '@/notification/components/contents/structure/StructureSeatNotificationContent'
  ).then((module) => ({
    default: module.StructureSeatNotificationContent,
  })),
);

const ExportNotificationContent = lazy(() =>
  import(
    '@/notification/components/contents/import-export/export/components/ExportNotificationContent'
  ).then((module) => ({
    default: module.ExportNotificationContent,
  })),
);

const ImportNotificationContent = lazy(() =>
  import(
    '@/notification/components/contents/import-export/import/components/ImportNotificationContent'
  ).then((module) => ({
    default: module.ImportNotificationContent,
  })),
);

const ApprovalNotificationContent = lazy(() =>
  import('@/notification/components/contents/ApprovalNotificationContent').then(
    (module) => ({
      default: module.ApprovalNotificationContent,
    }),
  ),
);

const PermissionGroupNotificationContent = lazy(() =>
  import(
    '@/notification/components/contents/permissions/PermissionGroupNotificationContent'
  ).then((module) => ({
    default: module.PermissionGroupNotificationContent,
  })),
);

export const CoreNotificationContent = {
  welcome: WelcomeNotificationContent,
  approval: ApprovalNotificationContent,
  entity: StructureEntityNotificationContent,
  seat: StructureSeatNotificationContent,
  exports: ExportNotificationContent,
  imports: ImportNotificationContent,
  permissionGroup: PermissionGroupNotificationContent,
};
