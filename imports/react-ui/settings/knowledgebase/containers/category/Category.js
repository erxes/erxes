import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { Loading } from '/imports/react-ui/common';
import queries from '../../queries';
import { KbCategory } from '../../components';
import { saveCallback } from '../utils';

const propTypes = {
  item: PropTypes.object,
  getCategoryDetailQuery: PropTypes.object,
  getArticleListQuery: PropTypes.object,
};

const CategoryDetailContainer = props => {
  const { item, getCategoryDetailQuery, getArticleListQuery } = props;

  if (getArticleListQuery.loading || getCategoryDetailQuery.loading) {
    return <Loading title="Category Detail" sidebarSize="wide" spin hasRightSideBar />;
  }

  const save = doc => {
    let params = { doc };
    params._id = item._id;
    saveCallback(
      params,
      'editKbCategory',
      '/settings/knowledgebase/',
      getCategoryDetailQuery.refetch,
    );
  };

  const updatedProps = {
    ...props,
    item: {
      ...getCategoryDetailQuery.getKbCategoryDetail,
      refetch: getCategoryDetailQuery.refetch,
    },
    articles: getArticleListQuery.getKbArticleList,
    save,
  };
  return <KbCategory {...updatedProps} />;
};

CategoryDetailContainer.propTypes = propTypes;

export default compose(
  graphql(gql(queries.getCategoryDetail), {
    name: 'getCategoryDetailQuery',
    options: params => {
      return {
        variables: {
          _id: params.item._id,
        },
      };
    },
  }),
  graphql(gql(queries.getArticleList), {
    name: 'getArticleListQuery',
    options: () => ({
      fetchPolicy: 'network-only',
    }),
  }),
)(CategoryDetailContainer);
