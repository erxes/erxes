import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';
import { withProps } from 'erxes-ui';
import ForumSelect from '../../components/common/DiscussionSelect';
import { queries } from '../../graphql';
import {
  ForumsQueryResponse,
  TopicsQueryResponse,
  DiscussionsQueryResponse,
  DiscussionDetailQueryResponse
} from '../../types';

type Props = {
  callback?: () => void;
  onChangeConnection: (discussionId: string) => void;
  queryParams: any;
  history: any;
};

type FinalProps = {
  forumsQuery: ForumsQueryResponse;
  forumTopicsQuery: TopicsQueryResponse;
  forumDiscussionsQuery: DiscussionsQueryResponse;
  discussionDetailQuery: DiscussionDetailQueryResponse;
} & Props;

class ForumSelectContainer extends React.Component<FinalProps> {
  render() {
    const { forumsQuery, forumTopicsQuery, forumDiscussionsQuery } = this.props;

    if (
      forumsQuery.loading &&
      forumTopicsQuery.loading &&
      forumDiscussionsQuery.loading
    ) {
      return null;
    }

    const forums = forumsQuery.forums || [];
    const topics = forumTopicsQuery.forumTopics || [];
    const discussions = forumDiscussionsQuery.forumDiscussions || [];

    const extendedProps = {
      ...this.props,
      forums,
      topics,
      discussions
    };

    return <ForumSelect {...extendedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, ForumsQueryResponse>(gql(queries.forums), {
      name: 'forumsQuery'
    }),
    graphql<Props, TopicsQueryResponse, { forumId: string }>(
      gql(queries.forumTopics),
      {
        name: 'forumTopicsQuery',
        options: ({ queryParams }) => ({
          variables: {
            forumId: queryParams.forumId
          }
        })
      }
    ),
    graphql<Props, DiscussionsQueryResponse, { topicId: string }>(
      gql(queries.forumDiscussions),
      {
        name: 'forumDiscussionsQuery',
        options: ({ queryParams }) => ({
          variables: {
            topicId: queryParams.topicId
          }
        })
      }
    )
  )(ForumSelectContainer)
);
