import gql from 'graphql-tag';
import { router as routerUtils, withProps } from 'modules/common/utils';
import queryString from 'query-string';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router';
import { IRouterProps } from '../../common/types';
import { Empty, Inbox } from '../components';
import { queries } from '../graphql';
import {
  ConvesationsQueryVariables,
  LastConversationQueryResponse
} from '../types';
import { generateParams } from '../utils';

interface IProps extends IRouterProps {
  lastConversationQuery: any;
  queryParams: any;
}

class WithCurrentId extends React.Component<IProps> {
  componentWillReceiveProps(nextProps) {
    const {
      lastConversationQuery = {},
      history,
      queryParams: { _id }
    } = nextProps;

    const { conversationsGetLast, loading } = lastConversationQuery;

    if (!_id && conversationsGetLast && !loading) {
      routerUtils.setParams(history, { _id: conversationsGetLast._id });
    }
  }

  render() {
    const {
      queryParams: { _id }
    } = this.props;

    if (!_id) {
      return <Empty {...this.props} />;
    }

    const updatedProps = {
      ...this.props,
      currentConversationId: _id
    };

    return <Inbox {...updatedProps} />;
  }
}

const WithLastConversation = withProps<{ queryParams: any }>(
  compose(
    graphql<
      { queryParams: any },
      LastConversationQueryResponse,
      ConvesationsQueryVariables
    >(gql(queries.lastConversation), {
      name: 'lastConversationQuery',
      skip: ({ queryParams }) => queryParams._id,
      options: ({ queryParams }) => ({
        variables: generateParams(queryParams),
        fetchPolicy: 'network-only'
      })
    })
  )(WithCurrentId)
);

const WithQueryParams = (props: IRouterProps) => {
  const { location } = props;
  const queryParams = queryString.parse(location.search);

  const extendedProps = { ...props, queryParams };

  return <WithLastConversation {...extendedProps} />;
};

export default withProps<{}>(withRouter<IRouterProps>(WithQueryParams));
