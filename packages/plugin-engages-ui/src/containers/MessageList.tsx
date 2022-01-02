import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import Bulk from 'erxes-ui/lib/components/Bulk';
import { IRouterProps } from 'erxes-ui/lib/types';
import queryString from 'query-string';
import React from 'react';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import { withProps } from 'erxes-ui/lib/utils';
import * as routerUtils from 'erxes-ui/lib/utils/router';
import MessageList from '../components/MessageList';
import { queries } from '../graphql';
import {
  EngageMessagesQueryResponse,
  EngageMessagesTotalCountQueryResponse,
  ListQueryVariables
} from '../types';
import { generateListQueryVariables } from '../utils';

import { AuthTest } from '@erxes/ui';

import { helloWorld } from 'hello-world-npm';

console.log(helloWorld());

type Props = {
  type: string;
  queryParams: any;
  loading: boolean;
};

type FinalProps = {
  engageMessagesQuery: EngageMessagesQueryResponse;
  engageMessagesTotalCountQuery: EngageMessagesTotalCountQueryResponse;
  engageStatsQuery: any;
} & Props &
  IRouterProps;

type State = {
  bulk: any[];
  isAllSelected: boolean;
};

class MessageListContainer extends React.Component<FinalProps, State> {
  constructor(props: FinalProps) {
    super(props);

    this.state = {
      bulk: [],
      isAllSelected: false
    };
  }

  componentDidMount() {
    const { history } = this.props;

    const shouldRefetchList = routerUtils.getParam(
      history,
      'engageRefetchList'
    );

    if (shouldRefetchList) {
      this.refetch();
    }
  }

  refetch = () => {
    const {
      engageMessagesQuery,
      engageMessagesTotalCountQuery,
      engageStatsQuery
    } = this.props;

    engageMessagesQuery.refetch();
    engageMessagesTotalCountQuery.refetch();
    engageStatsQuery.refetch();
  };

  render() {
    return <AuthTest />

    const {
      queryParams,
      engageMessagesQuery,
      engageMessagesTotalCountQuery,
      engageStatsQuery
    } = this.props;

    const updatedProps = {
      kind: queryParams.kind,
      messages: engageMessagesQuery.engageMessages || [],
      totalCount: engageMessagesTotalCountQuery.engageMessagesTotalCount || 0,
      bulk: this.state.bulk,
      isAllSelected: this.state.isAllSelected,
      queryParams,
      loading: engageMessagesQuery.loading || engageStatsQuery.loading,
      emailPercentages: engageStatsQuery.engageEmailPercentages || {},
      refetch: this.refetch
    };

    const content = props => {
      return <MessageList {...updatedProps} {...props} />;
    };

    return <Bulk content={content} />;
  }
}

const MessageListContainerWithData = withProps<Props>(
  compose(
    graphql<Props, EngageMessagesQueryResponse, ListQueryVariables>(
      gql(queries.engageMessages),
      {
        name: 'engageMessagesQuery',
        options: props => ({
          variables: generateListQueryVariables(props)
        })
      }
    ),
    graphql<Props, EngageMessagesTotalCountQueryResponse, ListQueryVariables>(
      gql(queries.engageMessagesTotalCount),
      {
        name: 'engageMessagesTotalCountQuery',
        options: props => ({
          variables: generateListQueryVariables(props)
        })
      }
    ),
    graphql<Props, EngageMessagesTotalCountQueryResponse, ListQueryVariables>(
      gql(queries.engageEmailPercentages),
      {
        name: 'engageStatsQuery'
      }
    )
  )(MessageListContainer)
);

const EngageListContainer = (props: IRouterProps & Props) => {
  const queryParams = queryString.parse(props.location.search);

  const extendedProps = { ...props, queryParams };

  return <MessageListContainerWithData {...extendedProps} />;
};

export default withRouter<IRouterProps & Props>(EngageListContainer);
