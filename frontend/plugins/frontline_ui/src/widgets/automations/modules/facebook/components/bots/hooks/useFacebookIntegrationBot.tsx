import { GET_INTEGRATIONS } from '@/integrations/facebook/graphql/queries/fbIntegrationQueries';
import { useFacebookBots } from '@/integrations/facebook/hooks/useFacebookBots';
import { IntegrationType } from '@/types/Integration';
import { useQuery } from '@apollo/client';
import { useMemo } from 'react';

export type TFacebookBotPage = {
  accountId: string;
  pageId: string;
};

type TFacebookIntegrationRecord = {
  erxesApiId?: string;
  accountId?: string;
  facebookPageIds?: string[];
};

export const useFacebookIntegrationBot = (integrationId: string) => {
  const { data, loading } = useQuery<{
    facebookGetIntegrations: TFacebookIntegrationRecord[];
  }>(GET_INTEGRATIONS, {
    variables: { kind: IntegrationType.FACEBOOK_MESSENGER },
  });

  const { bots, loading: botsLoading } = useFacebookBots();

  return useMemo(() => {
    const integration = (data?.facebookGetIntegrations || []).find(
      ({ erxesApiId }) => erxesApiId === integrationId,
    );
    const pageIds = integration?.facebookPageIds || [];
    // The setup wizard binds one page per integration; a legacy multi-page
    // record has no single page a bot could be attached to.
    const pageId = pageIds.length === 1 ? pageIds[0] : undefined;
    const accountId = integration?.accountId;

    return {
      loading: loading || botsLoading,
      page: accountId && pageId ? { accountId, pageId } : undefined,
      bot: pageId ? bots.find((item) => item.pageId === pageId) : undefined,
    };
  }, [bots, botsLoading, data, integrationId, loading]);
};
