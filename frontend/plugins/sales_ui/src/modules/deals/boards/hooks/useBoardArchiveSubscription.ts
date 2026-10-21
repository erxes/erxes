import { useSubscription } from '@apollo/client';
import { toast } from 'erxes-ui';
import { refetchBoardArchiveQueries } from '../utils/refetchBoardArchiveQueries';
import { PIPELINE_LIST_CHANGED } from '@/deals/graphql/subscriptions/pipelineListChange';

export const useBoardArchiveSubscription = (): void => {
  useSubscription(PIPELINE_LIST_CHANGED, {
    onData: ({ client, data: result }) => {
      const action = result.data?.salesPipelineListChanged?.action;
      if (
        action !== 'boardArchived' &&
        action !== 'boardUnarchived' &&
        action !== 'boardArchiveProgress'
      )
        return;

      void refetchBoardArchiveQueries(client).catch((error: unknown) => {
        toast({
          title: error instanceof Error ? error.message : String(error),
          variant: 'destructive',
        });
      });
    },
  });
};
