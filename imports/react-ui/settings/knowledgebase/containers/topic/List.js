import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { Loading, pagination } from '/imports/react-ui/common';
import queries from '../../queries';
import { KbTopicList } from '../../components/topic';

const TopicListContainer = props => {
  const { getTopicListQuery, getTopicCountQuery, queryParams } = props;
  const { limit, loadMore, hasMore } = pagination(queryParams, getTopicCountQuery.getKbTopicCount);

  if (getTopicListQuery.loading) {
    return <Loading title="Topic list" sidebarSize="wide" spin hasRightSideBar />;
  }

  const removeItem = (id, callback) => {
    Meteor.call('knowledgebase.removeKbTopic', id, callback);
  };

  const updatedProps = {
    ...this.props,
    // If there's no customer fields config, all fields will be selected
    items: getTopicListQuery.getKbTopicList,
    refetch: getTopicListQuery.refetch,
    removeItem,
    loadMore,
    hasMore,
    limit,
  };

  return <KbTopicList {...updatedProps} />;
};

TopicListContainer.propTypes = {
  getTopicListQuery: PropTypes.object,
  getTopicCountQuery: PropTypes.object,
  queryParams: PropTypes.object,
};

export default compose(
  graphql(gql(queries.getTopicList), {
    name: 'getTopicListQuery',
  }),
  graphql(gql(queries.getTopicCount), {
    name: 'getTopicCountQuery',
  }),
)(TopicListContainer);
