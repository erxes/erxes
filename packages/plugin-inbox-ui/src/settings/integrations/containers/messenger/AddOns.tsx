import * as compose from 'lodash.flowright';

import {
  ILeadMessengerApp,
  IMessengerApps,
  ITopicMessengerApp,
  IWebsiteMessengerApp,
  IntegrationsQueryResponse
} from '@erxes/ui-inbox/src/settings/integrations/types';
import { gql } from '@apollo/client';
import { graphql, withApollo } from '@apollo/client/react/hoc';

import AddOns from '../../components/messenger/steps/AddOns';
import { IRouterProps } from '@erxes/ui/src/types';
import { ITopic } from '@erxes/ui-knowledgebase/src/types';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import { TopicsQueryResponse } from '@erxes/ui-knowledgebase/src/types';
import { queries as kbQueries } from '@erxes/ui-knowledgebase/src/graphql';
import { queries } from '@erxes/ui-inbox/src/settings/integrations/graphql';
import { withProps } from '@erxes/ui/src/utils';
import { withRouter } from 'react-router-dom';

type Props = {
  selectedBrand?: string;
  handleMessengerApps: (messengerApps: IMessengerApps) => void;
  leadMessengerApps?: ILeadMessengerApp[];
  knowledgeBaseMessengerApps?: ITopicMessengerApp[];
  websiteMessengerApps?: IWebsiteMessengerApp[];
};

type FinalProps = {
  knowledgeBaseTopicsQuery: TopicsQueryResponse;
  leadIntegrationsQuery: IntegrationsQueryResponse;
  leadIntegrationsTotalCountQuery: any;
} & IRouterProps &
  Props;

class KnowledgeBaseContainer extends React.Component<FinalProps> {
  render() {
    const {
      knowledgeBaseTopicsQuery,
      leadIntegrationsQuery,
      leadIntegrationsTotalCountQuery
    } = this.props;

    if (knowledgeBaseTopicsQuery.loading) {
      return <Spinner objective={true} />;
    }

    if (leadIntegrationsTotalCountQuery?.integrationsTotalCount) {
      leadIntegrationsQuery.refetch({
        perPage:
          leadIntegrationsTotalCountQuery?.integrationsTotalCount?.byKind?.lead
      });
    }

    const topics = knowledgeBaseTopicsQuery.knowledgeBaseTopics || [];
    const leads = leadIntegrationsQuery.integrations || [];

    const updatedProps = {
      ...this.props,
      topics: topics as ITopic[],
      leads
    };

    return <AddOns {...updatedProps} />;
  }
}

export default withProps<FinalProps>(
  compose(
    graphql<Props, TopicsQueryResponse>(gql(kbQueries.knowledgeBaseTopics), {
      name: 'knowledgeBaseTopicsQuery'
    }),
    graphql<{}>(gql(queries.integrationTotalCount), {
      name: 'leadIntegrationsTotalCountQuery'
    }),
    graphql<Props, IntegrationsQueryResponse>(gql(queries.integrations), {
      name: 'leadIntegrationsQuery',
      options: () => ({
        variables: {
          kind: 'lead',
          perPage: 20
        }
      })
    }),
    withApollo
  )(withRouter<FinalProps>(KnowledgeBaseContainer))
);
