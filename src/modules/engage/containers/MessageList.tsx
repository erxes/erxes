import gql from 'graphql-tag';
import { Bulk } from 'modules/common/components';
import { IRouterProps } from 'modules/common/types';
import queryString from 'query-string';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router';
import { MessageList } from '../components';
import { queries } from '../graphql';
import { generateListQueryVariables } from '../utils';

type Props = {
  type: string;
  queryParams: any;
  engageMessagesQuery: any;
  engageMessagesTotalCountQuery: any;
  loading: boolean;
};

type State = {
  bulk: any[];
  isAllSelected: boolean;
};

class MessageListContainer extends React.Component<Props, State> {
  constructor(props: Props) {
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
      bulk: this.state.bulk,
      isAllSelected: this.state.isAllSelected,
      kind: queryParams.kind,
      loading: engageMessagesQuery.loading,
      messages: engageMessagesQuery.engageMessages || [],
      queryParams,
      totalCount: engageMessagesTotalCountQuery.engageMessagesTotalCount || 0
    };

    return (
      <Bulk
        content={props => {
          return <MessageList {...updatedProps} {...props} />;
        }}
      />
    );
  }
}

const MessageListContainerWithData = compose(
  graphql<Props>(gql(queries.engageMessages), {
    name: 'engageMessagesQuery',
    options: props => ({
      fetchPolicy: 'network-only',
      variables: generateListQueryVariables(props)
    })
  }),
  graphql<Props>(gql(queries.engageMessagesTotalCount), {
    name: 'engageMessagesTotalCountQuery',
    options: props => ({
      fetchPolicy: 'network-only',
      variables: generateListQueryVariables(props)
    })
  })
)(MessageListContainer);

const EngageListContainer = (props: IRouterProps) => {
  const queryParams = queryString.parse(props.location.search);

  const extendedProps = { ...props, queryParams };

  return <MessageListContainerWithData {...extendedProps} />;
};

export default withRouter<IRouterProps>(EngageListContainer);
