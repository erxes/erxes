import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import { Alert, confirm } from 'modules/common/utils';
import gql from 'graphql-tag';
import { queries, mutations } from '../../graphql';
import { ArticleList } from '../../components';

const ArticleContainer = props => {
  const { articlesQuery, removeArticlesMutation } = props;

  // remove action
  const remove = _id => {
    confirm().then(() => {
      removeArticlesMutation({
        variables: { _id }
      })
        .then(() => {
          articlesQuery.refetch();

          Alert.success('Successfully deleted.');
        })
        .catch(error => {
          Alert.error(error.message);
        });
    });
  };

  const extendedProps = {
    ...this.props,
    remove,
    articlesQuery,
    articles: articlesQuery.knowledgeBaseArticles || [],
    loading: articlesQuery.loading
  };

  return <ArticleList {...extendedProps} />;
};

ArticleContainer.propTypes = {
  articlesQuery: PropTypes.object,
  removeArticlesMutation: PropTypes.func
};

export default compose(
  graphql(gql(queries.knowledgeBaseArticles), {
    name: 'articlesQuery',
    options: ({ queryParams, currentCategoryId }) => ({
      variables: {
        categoryIds: [currentCategoryId],
        page: queryParams.page,
        perPage: queryParams.perPage || 20
      },
      fetchPolicy: 'network-only'
    })
  }),
  graphql(gql(mutations.knowledgeBaseArticlesRemove), {
    name: 'removeArticlesMutation'
  })
)(ArticleContainer);
