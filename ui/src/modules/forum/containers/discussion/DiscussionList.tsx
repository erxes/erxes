import React from 'react';
import { generatePaginationParams } from 'modules/common/utils/router';

import * as compose from 'lodash.flowright';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { queries } from '../../graphql';

import { DiscussionList } from '../../components/discussion';

import { DiscussionsQueryResponse } from '../../types';

type Props = {
  queryParams: any;
  currentTopicId: string;
};

type FinalProps = {
  discussionsQuery: DiscussionsQueryResponse;
} & Props;

const DiscussionListContainer = (props: FinalProps) => {
  const { discussionsQuery, currentTopicId } = props;

  const updatedProps = {
    ...props,
    discussions: discussionsQuery.forumDiscussions || [],
    loading: discussionsQuery.loading,
    currentTopicId
  };

  return <DiscussionList {...updatedProps} />;
};

export default compose(
  graphql<
    Props,
    DiscussionsQueryResponse,
    { topicId: string; page: number; perPage: number }
  >(gql(queries.forumDiscussions), {
    name: 'discussionsQuery',
    options: ({ queryParams, currentTopicId }) => ({
      variables: {
        ...generatePaginationParams(queryParams),
        topicId: currentTopicId
      },
      fetchPolicy: 'network-only'
    })
  })
)(DiscussionListContainer);
