import { useQuery } from '@tanstack/react-query';
import { PageContainer } from 'erxes-ui';
import { useParams } from 'react-router-dom';
import { QueryState } from '~/components/QueryState';
import { useCan } from '~/modules/auth/session';
import { BroadcastEditor } from './BroadcastEditor';
import { broadcastQuery, isEditable } from './broadcastQueries';
import { BroadcastReport } from './BroadcastReport';

/** One broadcast: written and set up while a draft, its numbers once it goes. */
export const BroadcastPage = () => {
  const { id = '' } = useParams();
  const canManage = useCan()('broadcasts.manage');
  const broadcast = useQuery(broadcastQuery(id));

  return (
    <PageContainer>
      <QueryState query={broadcast} className="py-12">
        {(data) =>
          canManage && isEditable(data.status) ? (
            <BroadcastEditor key={data.id} broadcast={data} />
          ) : (
            <BroadcastReport broadcast={data} />
          )
        }
      </QueryState>
    </PageContainer>
  );
};
