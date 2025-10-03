import { useQuery } from '@apollo/client';
import { CALL_INTEGRATION_DETAIL } from '../graphql/queries/callConfigQueries';
import { callEditSheetAtom } from '../states/callEditSheetAtom';
import { useAtom } from 'jotai';
import { toast } from 'erxes-ui';

export const useCallIntegrationDetail = () => {
  const [callEditSheet] = useAtom(callEditSheetAtom);

  const { data, loading } = useQuery(CALL_INTEGRATION_DETAIL, {
    variables: {
      integrationId: callEditSheet,
    },
    skip: !callEditSheet,
    onError: (e) => {
      toast({
        title: 'Uh oh! Something went wrong while getting integration detail',
        description: e.message,
        variant: 'destructive',
      });
    },
  });

  const { callsIntegrationDetail } = data || {};

  return { callsIntegrationDetail, loading };
};
