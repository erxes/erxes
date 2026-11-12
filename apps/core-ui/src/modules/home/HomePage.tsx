import { DashboardToolbar } from './dashboard/components/DashboardToolbar';
import { DashboardWidgetCatalog } from './dashboard/components/DashboardWidgetCatalog';
import { HomeDashboard } from './dashboard/components/HomeDashboard';
import { DashboardProvider, useDashboard } from './dashboard/context/DashboardProvider';
import { HomeGreeting } from './components/HomeGreeting';

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
    </div>
  );
};

/** `/`: the greeting and the user's dashboard of widgets. */
export const HomePage = () => (
  <DashboardProvider>
    <HomeLayout />
  </DashboardProvider>
);
