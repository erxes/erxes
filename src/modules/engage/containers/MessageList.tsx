import gql from 'graphql-tag';
import { Bulk } from 'modules/common/components';
import { IRouterProps } from 'modules/common/types';
import queryString from 'query-string';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router';
import { withProps } from '../../common/utils';
import { MessageList } from '../components';
import { queries } from '../graphql';
import { IEngageMessage } from '../types';
import { generateListQueryVariables } from '../utils';

type QueryVariables = {
  page?: number;
  perPage?: number;
  kind?: string;
  status?: string;
  tag?: string;
  ids?: string[];
};

type EngageMessagesQueryResponse = {
  engageMessages: IEngageMessage[];
  loading: boolean;
  refetch: () => void;
};

type EngageMessagesTotalCountQueryResponse = {
  engageMessagesTotalCount: number;
  loading: boolean;
  refetch: () => void;
};

type Props = {
  type: string;
  queryParams: any;
  loading: boolean;
};

type FinalProps = {
  engageMessagesQuery: EngageMessagesQueryResponse;
  engageMessagesTotalCountQuery: EngageMessagesTotalCountQueryResponse;
} & Props;

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

  render() {
    const {
      queryParams,
      engageMessagesQuery,
      engageMessagesTotalCountQuery
    } = this.props;

    const updatedProps = {
      kind: queryParams.kind,
      messages: engageMessagesQuery.engageMessages || [],
      totalCount: engageMessagesTotalCountQuery.engageMessagesTotalCount || 0,
      bulk: this.state.bulk,
      isAllSelected: this.state.isAllSelected,
      queryParams,
      loading: engageMessagesQuery.loading
    };

    const content = props => {
      return <MessageList {...updatedProps} {...props} />;
    };

    return <Bulk content={content} />;
  }
}

const MessageListContainerWithData = withProps<Props>(
  compose(
    graphql<Props, EngageMessagesQueryResponse, QueryVariables>(
      gql(queries.engageMessages),
      {
        name: 'engageMessagesQuery',
        options: props => ({
          variables: generateListQueryVariables(props),
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<Props, EngageMessagesTotalCountQueryResponse, QueryVariables>(
      gql(queries.engageMessagesTotalCount),
      {
        name: 'engageMessagesTotalCountQuery',
        options: props => ({
          variables: generateListQueryVariables(props),
          fetchPolicy: 'network-only'
        })
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
