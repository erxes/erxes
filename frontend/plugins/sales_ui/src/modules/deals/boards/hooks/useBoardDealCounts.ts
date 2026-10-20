import { GET_BOARD_DEAL_COUNTS } from '@/deals/graphql/queries/BoardsQueries';
import { DEAL_COUNTS_CHANGED } from '@/deals/graphql/subscriptions/dealListChange';
import { IBoard } from '@/deals/types/boards';
import { useQuery, useSubscription } from '@apollo/client';
import { isDefined } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useEffect, useMemo, useRef } from 'react';
import { currentUserState } from 'ui-modules';

export const useBoardDealCounts = ({
  boards,
  pipelineId,
}: {
  boards?: IBoard[];
  pipelineId?: string | null;
}) => {
  const currentUser = useAtomValue(currentUserState);
  const { data, refetch } = useQuery(GET_BOARD_DEAL_COUNTS, {
    fetchPolicy: 'cache-and-network',
  });

  const seenBoards = useRef<IBoard[] | undefined>(undefined);

  useEffect(() => {
    if (!boards) return;
    if (seenBoards.current) void refetch();
    seenBoards.current = boards;
  }, [boards, refetch]);

  useSubscription(DEAL_COUNTS_CHANGED, {
    variables: pipelineId
      ? { pipelineId, userId: currentUser?._id }
      : undefined,
    skip: !pipelineId || !currentUser?._id,
    onData: () => void refetch(),
  });

  return useMemo(() => {
    const byPipeline: Record<string, number> = {};
    const byBoard: Record<string, number> = {};

    for (const board of data?.salesBoards?.filter(isDefined) || []) {
      byBoard[board._id] = 0;

      for (const pipeline of board.pipelines?.filter(isDefined) || []) {
        const count = pipeline.itemsTotalCount ?? 0;
        byPipeline[pipeline._id] = count;

        if (pipeline.status !== 'archived') {
          byBoard[board._id] += count;
        }
      }
    }

    return { byPipeline, byBoard, loaded: !!data };
  }, [data]);
};
