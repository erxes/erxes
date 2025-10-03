import { lazy } from 'react';

const WelcomeNotificationContent = lazy(() =>
  import(
    '@/notification/my-inbox/components/contents/system/WelcomeMessage'
  ).then((module) => ({
    default: module.WelcomeMessageContent,
  })),
);

const BranchNotificationContent = lazy(() =>
  import(
    '@/notification/my-inbox/components/contents/structure/BranchNotificationContent'
  ).then((module) => ({
    default: module.BranchNotificationContent,
  })),
);

const DepartmentNotificationContent = lazy(() =>
  import(
    '@/notification/my-inbox/components/contents/structure/DepartmentNotificationContent'
  ).then((module) => ({
    default: module.DepartmentNotificationContent,
  })),
);

export const CoreNotificationContent = {
  welcome: WelcomeNotificationContent,
  branch: BranchNotificationContent,
  department: DepartmentNotificationContent,
};
