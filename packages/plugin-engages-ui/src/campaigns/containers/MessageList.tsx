import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import Bulk from '@erxes/ui/src/components/Bulk';
import { IRouterProps } from '@erxes/ui/src/types';
import queryString from 'query-string';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import { withRouter } from 'react-router-dom';
import { withProps } from '@erxes/ui/src/utils';
import * as routerUtils from '@erxes/ui/src/utils/router';
import MessageList from '../components/MessageList';
import { queries } from '@erxes/ui-engage/src/graphql';
import {
  EngageMessagesQueryResponse,
  EngageMessagesTotalCountQueryResponse,
  ListQueryVariables
} from '@erxes/ui-engage/src/types';
import { generateListQueryVariables } from '@erxes/ui-engage/src/utils';

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
