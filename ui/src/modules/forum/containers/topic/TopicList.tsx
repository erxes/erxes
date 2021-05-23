import React from 'react';
import { TopicList } from '../../components/topic';

import * as compose from 'lodash.flowright';

import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { queries } from '../../graphql';

const TopicListContainer = props => {
  const { forumTopicsQuery } = props;

  if (forumTopicsQuery.loading) {
    return null;
  }

  const forumTopics = forumTopicsQuery.forumTopics || [];

  const updatedProps = {
    ...props,
    forumTopics
  };

  return <TopicList {...updatedProps} />;
};

export default compose(
  graphql(gql(queries.forumTopics), {
    name: 'forumTopicsQuery'
  })
)(TopicListContainer);
