import gql from 'graphql-tag';
import { Bulk } from 'modules/common/components';
import { Sidebar as DumbSidebar } from 'modules/inbox/components/leftSidebar';
import { queries } from 'modules/inbox/graphql';
import { KIND_CHOICES as INTEGRATIONS_TYPES } from 'modules/settings/integrations/constants';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router';
import { IRouterProps } from '../../../common/types';
import { withProps } from '../../../common/utils';
import { ConversationsTotalCountQueryResponse } from '../../types';

type Props = {
  queryParams: any;
  currentConversationId?: string;
};

type FinalProps = {
  totalCountQuery: ConversationsTotalCountQueryResponse;
} & Props &
  IRouterProps;

class Sidebar extends React.Component<FinalProps> {
  render() {
    const { totalCountQuery } = this.props;

    const integrations = INTEGRATIONS_TYPES.ALL_LIST.map(item => ({
      _id: item,
      name: item
    }));

    const totalCount = totalCountQuery.conversationsTotalCount || 0;

    const updatedProps = {
      ...this.props,
      integrations,
      totalCount
    };

    const content = props => {
      return <DumbSidebar {...updatedProps} {...props} />;
    };

    return <Bulk content={content} />;
  }
}

const generateOptions = queryParams => ({
  ...queryParams,
  limit: queryParams.limit || 10
});

export default withProps<Props>(
  compose(
    graphql<Props, ConversationsTotalCountQueryResponse>(
      gql(queries.totalConversationsCount),
      {
        name: 'totalCountQuery',
        options: ({ queryParams }) => ({
          notifyOnNetworkStatusChange: true,
          variables: generateOptions(queryParams)
        })
      }
    )
  )(withRouter<FinalProps>(Sidebar))
);
