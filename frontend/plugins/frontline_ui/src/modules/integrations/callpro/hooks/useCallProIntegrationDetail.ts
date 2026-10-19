import { useQuery } from '@apollo/client';
import { useAtomValue } from 'jotai';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { CALL_PRO_INTEGRATION_DETAIL } from '@/integrations/callpro/graphql/queries/callProQueries';
import { callProEditSheetAtom } from '@/integrations/callpro/states/callProEditSheetAtom';

export const useCallProIntegrationDetail = () => {
  const { t } = useTranslation('frontline');
  const integrationId = useAtomValue(callProEditSheetAtom);

  const { data, loading } = useQuery(CALL_PRO_INTEGRATION_DETAIL, {
    variables: integrationId ? { integrationId } : undefined,
    skip: !integrationId,
    onError: (e) => {
      toast({
        title: t('something-went-wrong-getting-integration-detail'),
        description: e.message,
        variant: 'destructive',
      });
    },
  });

  const callProIntegrationDetail = data?.callProIntegrationDetail ?? undefined;

  return { callProIntegrationDetail, loading };
};
