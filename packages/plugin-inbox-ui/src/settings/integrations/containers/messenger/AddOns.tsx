import React, { useEffect } from 'react';
import { gql, useQuery, useApolloClient } from '@apollo/client';
import AddOns from '../../components/messenger/steps/AddOns';
import Spinner from '@erxes/ui/src/components/Spinner';
import { queries as kbQueries } from '@erxes/ui-knowledgebase/src/graphql';
import { queries } from '@erxes/ui-inbox/src/settings/integrations/graphql';
import {
  ILeadMessengerApp,
  IMessengerApps,
  ITopicMessengerApp,
  IWebsiteMessengerApp,
  IntegrationsQueryResponse,
} from '@erxes/ui-inbox/src/settings/integrations/types';
import { ITopic } from '@erxes/ui-knowledgebase/src/types';
import { TopicsQueryResponse } from '@erxes/ui-knowledgebase/src/types';

type Props = {
  selectedBrand?: string;
  handleMessengerApps: (messengerApps: IMessengerApps) => void;
  leadMessengerApps?: ILeadMessengerApp[];
  knowledgeBaseMessengerApps?: ITopicMessengerApp[];
  websiteMessengerApps?: IWebsiteMessengerApp[];
};

const KnowledgeBaseContainer: React.FC<Props> = (props) => {
  const client = useApolloClient();

  const { data: knowledgeBaseTopicsData, loading: kbTopicsLoading } = useQuery<TopicsQueryResponse>(
    gql(kbQueries.knowledgeBaseTopicsShort)
  );

  const { data: leadIntegrationsTotalCountData } = useQuery(
    gql(queries.integrationTotalCount)
  );

  const { data: leadIntegrationsData, refetch: refetchLeads } = useQuery<IntegrationsQueryResponse>(
    gql(queries.integrations),
    {
      variables: {
        kind: 'lead',
        perPage: 20,
      },
    }
  );

  useEffect(() => {
    if (leadIntegrationsTotalCountData?.integrationsTotalCount) {
      refetchLeads({
        perPage: leadIntegrationsTotalCountData.integrationsTotalCount.byKind.lead,
      });
    }
  }, [leadIntegrationsTotalCountData, refetchLeads]);

  if (kbTopicsLoading) {
    return <Spinner objective={true} />;
  }

  const topics = knowledgeBaseTopicsData?.knowledgeBaseTopics || [];
  const leads = leadIntegrationsData?.integrations || [];

  const updatedProps = {
    ...props,
    topics: topics as ITopic[],
    leads,
  };

  return <AddOns {...updatedProps} />;
};

export default KnowledgeBaseContainer;
