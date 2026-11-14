import { HomeGreeting } from '@/home/components/HomeGreeting';
import { DashboardPendingConfigDialog } from '@/home/dashboard/components/DashboardPendingConfigDialog';
import { DashboardToolbar } from '@/home/dashboard/components/DashboardToolbar';
import { DashboardWidgetCatalog } from '@/home/dashboard/components/DashboardWidgetCatalog';
import { HomeDashboard } from '@/home/dashboard/components/HomeDashboard';
import {
  DashboardProvider,
  useDashboard,
} from '@/home/dashboard/context/DashboardProvider';

const HomeLayout = () => {
  const { isEditing } = useDashboard();

  return (
    <div className="flex h-full bg-muted/30">
      <div className="styled-scroll h-full min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <HomeGreeting />
            <DashboardToolbar />
          </div>
          <HomeDashboard />
        </div>
      </div>
      {isEditing && <DashboardWidgetCatalog />}
      <DashboardPendingConfigDialog />
    </div>
  );
};

export const HomePage = () => (
  <DashboardProvider>
    <HomeLayout />
  </DashboardProvider>
);
