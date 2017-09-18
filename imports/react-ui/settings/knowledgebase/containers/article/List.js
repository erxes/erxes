import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { Meteor } from 'meteor/meteor';
import { Loading, pagination } from '/imports/react-ui/common';
// TODO: create directory named graphql and put queries inside it
import queries from '../../queries';
import { KbArticleList } from '../../components/article';

const propTypes = {
  getArticleListQuery: PropTypes.object.isRequired,
  getArticleCountQuery: PropTypes.object.isRequired,
  queryParams: PropTypes.object.isRequired,
};

const ArticleListContainer = props => {
  const { getArticleListQuery, getArticleCountQuery, queryParams } = props;
  const { limit, loadMore, hasMore } = pagination(
    queryParams,
    getArticleCountQuery.getKbArticleCount,
  );

  if (getArticleListQuery.loading) {
    return <Loading title="List of articles" sidebarSize="wide" spin hasRightSideBar />;
  }

  const removeItem = (id, callback) => {
    Meteor.call('knowledgebase.removeKbArticle', id, callback);
  };

  const updatedProps = {
    ...this.props,
    items: getArticleListQuery.getKbArticleList,
    refetch: getArticleListQuery.refetch,
    removeItem,
    loadMore,
    hasMore,
    limit,
  };

  return <KbArticleList {...updatedProps} />;
};

ArticleListContainer.propTypes = propTypes;

export default compose(
  graphql(gql(queries.getArticleList), {
    name: 'getArticleListQuery',
  }),
  graphql(gql(queries.getArticleCount), {
    name: 'getArticleCountQuery',
  }),
)(ArticleListContainer);
