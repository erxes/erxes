import gql from 'graphql-tag';
import { Bulk } from 'modules/common/components';
import { Sidebar as DumbSidebar } from 'modules/inbox/components/leftSidebar';
import { queries } from 'modules/inbox/graphql';
import { KIND_CHOICES as INTEGRATIONS_TYPES } from 'modules/settings/integrations/constants';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router';
import { IRouterProps } from '../../../common/types';

interface IProps extends IRouterProps {
  queryParams: any;
  currentConversationId?: string;
}

type QueryResponse = {
  totalCountQuery: any;
};

class Sidebar extends React.Component<IProps & QueryResponse> {
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

const WithData = compose(
  graphql(gql(queries.totalConversationsCount), {
    name: 'totalCountQuery',
    options: ({ queryParams }: { queryParams: any }) => ({
      notifyOnNetworkStatusChange: true,
      variables: generateOptions(queryParams)
    })
  })
)(Sidebar);

export default withRouter<IProps>(WithData);
