import { useQuery } from '@apollo/client';
import { useAtomValue } from 'jotai';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { CALL_PRO_INTEGRATION_DETAIL } from '@/integrations/callpro/graphql/queries/callProQueries';
import { callProEditSheetAtom } from '@/integrations/callpro/states/callProEditSheetAtom';
import { ICallProIntegrationDetail } from '@/integrations/callpro/types/callProTypes';

export const useCallProIntegrationDetail = () => {
  const { t } = useTranslation('frontline');
  const integrationId = useAtomValue(callProEditSheetAtom);

  const { data, loading } = useQuery<{
    callProIntegrationDetail: ICallProIntegrationDetail | null;
  }>(CALL_PRO_INTEGRATION_DETAIL, {
    variables: { integrationId },
    skip: !integrationId,
    onError: (e) => {
      toast({
        title: t('something-went-wrong-getting-integration-detail'),
        description: e.message,
        variant: 'destructive',
      });
    },
  });

  const { callProIntegrationDetail } = data || {};

  return { callProIntegrationDetail, loading };
};
