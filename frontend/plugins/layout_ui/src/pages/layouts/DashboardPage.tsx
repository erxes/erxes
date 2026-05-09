import { useParams } from 'react-router-dom';
import { GridEditor } from '@/grid/GridEditor';
import { dashboardPreset } from '@/grid/presetConfigs';
import { LayoutConfig } from '@/grid/types';
import { PageShell } from '@/shell/PageShell';

export const DashboardPage = () => {
  const { id } = useParams<{ id: string }>();
  const handleChange = (next: LayoutConfig) => {
    // Future: persist via layout_api. For now, log so the dynamic flow is observable.
    // eslint-disable-next-line no-console
    console.log('[layout] dashboard changed', id, next);
  };

  return (
    <PageShell
      title={`Dashboard: ${id ?? 'demo'}`}
      header={{
        breadcrumbs: [
          { label: 'Layout', to: '/layout' },
          { label: 'Dashboards', to: '/layout' },
          { label: id ?? 'demo' },
        ],
      }}
    >
      <GridEditor config={dashboardPreset} onChange={handleChange} />
    </PageShell>
  );
};
