import { Spinner } from 'erxes-ui';
import { useDashboard } from '../../hooks/useDashboard';
import { AgentTable } from './AgentTable';
import { SectionCard } from '../SectionCard';
import { useTranslation } from 'react-i18next';

/** Agents tab: leaderboard table with expandable drilldown. */
export function AgentsSection() {
  const { t } = useTranslation('frontline');
  const { agentStats, loading } = useDashboard();

  return (
    <SectionCard
      title={t('agent-leaderboard')}
      description={t('per-agent-performance')}
      accentClass="bg-[var(--chart-2)]"
      loading={loading}
      skeletonHeight="h-64"
    >
      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : (
        <AgentTable stats={agentStats} />
      )}
    </SectionCard>
  );
}
