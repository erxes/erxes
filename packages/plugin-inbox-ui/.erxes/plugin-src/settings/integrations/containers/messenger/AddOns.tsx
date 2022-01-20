import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import Spinner from '@erxes/ui/src/components/Spinner';
import { IRouterProps } from '@erxes/ui/src/types';
import { withProps } from '@erxes/ui/src/utils';
import { queries as kbQueries } from '@erxes/ui-settings/src/general/graphql';
import { TopicsQueryResponse } from '@erxes/ui-inbox/src/types';
import { queries } from '@erxes/ui-settings/src/integrations/graphql';
import React from 'react';
import { graphql, withApollo } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import AddOns from '../../components/messenger/steps/AddOns';
import {
  ILeadMessengerApp,
  IMessengerApps,
  IntegrationsQueryResponse,
  ITopicMessengerApp,
  IWebsiteMessengerApp
} from '../../types';

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
} & IRouterProps &
  Props;

class KnowledgeBaseContainer extends React.Component<FinalProps> {
  render() {
    const { knowledgeBaseTopicsQuery, leadIntegrationsQuery } = this.props;

    if (knowledgeBaseTopicsQuery.loading) {
      return <Spinner objective={true} />;
    }

    const topics = knowledgeBaseTopicsQuery.knowledgeBaseTopics || [];
    const leads = leadIntegrationsQuery.integrations || [];

    const updatedProps = {
      ...this.props,
      topics,
      leads
    };

    return <AddOns {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, TopicsQueryResponse>(gql(kbQueries.knowledgeBaseTopics), {
      name: 'knowledgeBaseTopicsQuery'
    }),
    graphql<Props, IntegrationsQueryResponse>(gql(queries.integrations), {
      name: 'leadIntegrationsQuery',
      options: () => ({
        variables: {
          kind: 'lead'
        }
      })
    }),
    withApollo
  )(withRouter<FinalProps>(KnowledgeBaseContainer))
);
