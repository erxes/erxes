import { useQuery } from '@apollo/client';
import { CALL_INTEGRATION_DETAIL } from '../graphql/queries/callConfigQueries';
import { callEditSheetAtom } from '../states/callEditSheetAtom';
import { useAtom } from 'jotai';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const useCallIntegrationDetail = () => {
  const { t } = useTranslation('frontline');
  const [callEditSheet] = useAtom(callEditSheetAtom);

  const { data, loading } = useQuery(CALL_INTEGRATION_DETAIL, {
    variables: {
      integrationId: callEditSheet,
    },
    skip: !callEditSheet,
    onError: (e) => {
      toast({
        title: t('something-went-wrong-getting-integration-detail'),
        description: e.message,
        variant: 'destructive',
      });
    },
  });

  const { callsIntegrationDetail } = data || {};

  return { callsIntegrationDetail, loading };
};
