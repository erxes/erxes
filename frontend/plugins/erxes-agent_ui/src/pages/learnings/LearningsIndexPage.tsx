import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { IconBulb, IconRefresh } from '@tabler/icons-react';
import { Badge, Button } from 'erxes-ui';
import { MASTRA_LEARNINGS } from '~/graphql/queries';
import { ResourceIndexLayout } from '~/components/ResourceIndexLayout';
import { LearningDetailSheet } from './components/LearningDetailSheet';
import { useLearningColumns } from './hooks/useLearningColumns';
import { ILearningRow, StatusFilter, STATUS_FILTERS } from './types';

export const LearningsIndexPage = () => {
  const [status, setStatus] = useState<StatusFilter>('');
  const [selected, setSelected] = useState<ILearningRow | null>(null);

  const { data, loading, refetch } = useQuery(MASTRA_LEARNINGS, {
    variables: { status: status || undefined, perPage: 200 },
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });

  const items: ILearningRow[] = data?.mastraLearnings?.list ?? [];
  const totalCount: number = data?.mastraLearnings?.totalCount ?? items.length;

  const columns = useLearningColumns({ setSelected, refetch });

  return (
    <>
      <ResourceIndexLayout<ILearningRow>
        icon={IconBulb}
        title="Agent learnings"
        rootPath="/erxes-agent/learnings"
        sessionKey="erxes_agent_learnings"
        columns={columns}
        data={items}
        loading={loading}
        skeletonRows={8}
        stickyColumns={['more', 'statement']}
        headerExtra={
          <>
            <div className="flex items-center gap-1">
              {STATUS_FILTERS.map((f) => (
                <Button
                  key={f.value || 'all'}
                  variant={status === f.value ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setStatus(f.value)}
                >
                  {f.label}
                </Button>
              ))}
            </div>
            <Badge variant="secondary">
              {totalCount} {totalCount === 1 ? 'learning' : 'learnings'}
            </Badge>
            <Button
              variant="secondary"
              onClick={() => refetch()}
              disabled={loading}
            >
              <IconRefresh /> Refresh
            </Button>
          </>
        }
        empty={{
          className: 'max-w-md',
          title: 'No learnings yet',
          description:
            'Learnings are distilled from chat over time and reinforced by 👍 / 👎 on agent replies. Approved learnings are woven into every agent turn — they appear here as they accrue.',
          action: (
            <Button variant="secondary" asChild>
              <Link to="/erxes-agent/chat">Open Chat</Link>
            </Button>
          ),
        }}
      />

      <LearningDetailSheet item={selected} onClose={() => setSelected(null)} />
    </>
  );
};
