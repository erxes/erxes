import gql from 'graphql-tag';
import { router as routerUtils } from 'modules/common/utils';
import * as React from 'react';
import { graphql } from 'react-apollo';
import { Empty, Inbox } from '../components';
import { queries } from '../graphql';
import {
  ConvesationsQueryVariables,
  LastConversationQueryResponse
} from '../types';
import { generateParams } from '../utils';

interface IRouteProps {
  queryParams: any;
  history: any;
}

interface IProps extends IRouteProps {
  conversationsGetLast: any;
  loading: boolean;
}

class WithCurrentId extends React.Component<IProps> {
  componentWillReceiveProps(nextProps: IProps) {
    const { conversationsGetLast, loading, history, queryParams } = nextProps;
    const { _id } = queryParams;

    if (!_id && conversationsGetLast && !loading) {
      routerUtils.setParams(history, { _id: conversationsGetLast._id }, true);
    }
  }

  render() {
    const { queryParams } = this.props;
    const { _id } = queryParams;

    if (!_id) {
      return <Empty queryParams={queryParams} />;
    }

    return <Inbox queryParams={queryParams} currentConversationId={_id} />;
  }
}

export default graphql<
  IRouteProps,
  LastConversationQueryResponse,
  ConvesationsQueryVariables,
  IProps
>(gql(queries.lastConversation), {
  skip: (props: IRouteProps) => {
    return props.queryParams._id;
  },
  options: (props: IRouteProps) => ({
    variables: generateParams(props.queryParams),
    fetchPolicy: 'network-only'
  }),
  props: ({ data, ownProps }: { data?: any; ownProps: IRouteProps }) => {
    return {
      conversationsGetLast: data.conversationsGetLast,
      loading: data.loading,
      history: ownProps.history,
      queryParams: ownProps.queryParams
    };
  }
})(WithCurrentId);
