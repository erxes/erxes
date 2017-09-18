import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { Meteor } from 'meteor/meteor';
import { Loading, pagination } from '/imports/react-ui/common';
// TODO: create directory named graphql and put queries inside it
import queries from '../../queries';
import { KbCategoryList } from '../../components/category';

const propTypes = {
  getCategoryListQuery: PropTypes.object.isRequired,
  getCategoryCountQuery: PropTypes.object.isRequired,
  queryParams: PropTypes.object.isRequired,
};

const CategoryListContainer = props => {
  const { getCategoryListQuery, getCategoryCountQuery, queryParams } = props;
  const { limit, loadMore, hasMore } = pagination(
    queryParams,
    getCategoryCountQuery.getKbCategoryCount,
  );

  if (getCategoryListQuery.loading) {
    return <Loading title="List of categories" sidebarSize="wide" spin hasRightSideBar />;
  }

  const removeItem = (id, callback) => {
    Meteor.call('knowledgebase.removeKbCategory', id, callback);
  };

  const updatedProps = {
    ...this.props,
    items: getCategoryListQuery.getKbCategoryList,
    refetch: getCategoryListQuery.refetch,
    removeItem,
    loadMore,
    hasMore,
    limit,
  };

  return <KbCategoryList {...updatedProps} />;
};

CategoryListContainer.propTypes = propTypes;

export default compose(
  graphql(gql(queries.getCategoryList), {
    name: 'getCategoryListQuery',
  }),
  graphql(gql(queries.getCategoryCount), {
    name: 'getCategoryCountQuery',
  }),
)(CategoryListContainer);
