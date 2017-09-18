import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { Meteor } from 'meteor/meteor';
import { Loading, pagination } from '/imports/react-ui/common';
// TODO: create directory named graphql and put queries inside it
import queries from '../../queries';
import { KbTopicList } from '../../components/topic';

const propTypes = {
  getTopicListQuery: PropTypes.object.isRequired,
  getTopicCountQuery: PropTypes.object.isRequired,
  queryParams: PropTypes.object.isRequired,
};

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
    items: getTopicListQuery.getKbTopicList,
    refetch: getTopicListQuery.refetch,
    removeItem,
    loadMore,
    hasMore,
    limit,
  };

  return <KbTopicList {...updatedProps} />;
};

TopicListContainer.propTypes = propTypes;

export default compose(
  graphql(gql(queries.getTopicList), {
    name: 'getTopicListQuery',
  }),
  graphql(gql(queries.getTopicCount), {
    name: 'getTopicCountQuery',
  }),
)(TopicListContainer);
