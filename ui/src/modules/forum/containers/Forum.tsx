import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { IRouterProps } from 'modules/common/types';
import { router as routerUtils, withProps } from 'modules/common/utils';
import queryString from 'query-string';
import React from 'react';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import ForumComponent from '../components/Forum';
import {
  ITopic,
  TopicDetailQueryResponse,
  DiscussionsTotalCountQueryResponse
} from '../types';
import { queries } from '../graphql';

type Props = {
  queryParams: any;
  currentTopicId: string;
};

type FinalProps = {
  topicDetailQuery?: TopicDetailQueryResponse;
  discussionsCountQuery?: DiscussionsTotalCountQueryResponse;
} & Props &
  IRouterProps;

const Forum = (props: FinalProps) => {
  const { topicDetailQuery, discussionsCountQuery } = props;

  const currentTopic = topicDetailQuery && topicDetailQuery.forumTopicDetail;

  const discussionsCount =
    discussionsCountQuery && discussionsCountQuery.forumDiscussionsTotalCount;

  const updatedProps = {
    ...props,
    currentTopic: currentTopic || ({} as ITopic),
    discussionsCount: discussionsCount || 0
  };

  return <ForumComponent {...updatedProps} />;
};

const ForumContainer = withProps<Props>(
  compose(
    graphql<Props, TopicDetailQueryResponse, { _id: string }>(
      gql(queries.forumTopicDetail),
      {
        name: 'topicDetailQuery',
        options: ({ currentTopicId }) => ({
          variables: {
            _id: currentTopicId
          },
          fetchPolicy: 'network-only'
        }),
        skip: ({ currentTopicId }) => !currentTopicId
      }
    ),
    graphql<Props, DiscussionsTotalCountQueryResponse, { topicId: string }>(
      gql(queries.forumDiscussionsTotalCount),
      {
        name: 'discussionsCountQuery',
        options: ({ currentTopicId }) => ({
          variables: {
            topicId: currentTopicId
          }
        }),
        skip: ({ currentTopicId }) => !currentTopicId
      }
    )
  )(Forum)
);

type WithCurrentIdProps = {
  history: any;
  queryParams: any;
};

type WithCurrentIdFinalProps = {
  lastTopicQuery: any;
} & WithCurrentIdProps;

class WithCurrentId extends React.Component<WithCurrentIdFinalProps> {
  componentWillReceiveProps(nextProps: WithCurrentIdFinalProps) {
    const {
      lastTopicQuery,
      history,
      queryParams: { _id }
    } = nextProps;

    if (!lastTopicQuery) {
      return;
    }

    const { forumTopicsGetLast, loading } = lastTopicQuery;

    if (!_id && forumTopicsGetLast && !loading) {
      routerUtils.setParams(
        history,
        {
          id: forumTopicsGetLast._id
        },
        true
      );
    }
  }

  render() {
    const {
      queryParams: { id }
    } = this.props;

    const updatedProps = {
      ...this.props,
      currentTopicId: id || ''
    };

    return <ForumContainer {...updatedProps} />;
  }
}

const WithLastTopic = withProps<WithCurrentIdProps>(
  compose(
    graphql(gql(queries.forumTopicsGetLast), {
      name: 'lastTopicQuery',
      skip: ({ queryParams }: { queryParams: any }) => queryParams.id,
      options: () => ({ fetchPolicy: 'network-only' })
    })
  )(WithCurrentId)
);

const WithQueryParams = (props: IRouterProps) => {
  const { location } = props;
  const queryParams = queryString.parse(location.search);

  const extendedProps = { ...props, queryParams };

  return <WithLastTopic {...extendedProps} />;
};

export default withProps<{}>(withRouter<IRouterProps>(WithQueryParams));
