import { useParams } from 'react-router-dom';
import { GridRenderer } from '@/grid/GridRenderer';
import { samplePagePreset } from '@/grid/presetConfigs';
import { PageShell } from '@/shell/PageShell';

export const StaticPage = () => {
  const { slug } = useParams<{ slug: string }>();

  return (
    <PageShell
      title={`Page: ${slug ?? 'sample'}`}
      header={{
        breadcrumbs: [
          { label: 'Layout', to: '/layout' },
          { label: 'Pages', to: '/layout' },
          { label: slug ?? 'sample' },
        ],
      }}
    >
      <GridRenderer config={samplePagePreset} />
    </PageShell>
  );
};
