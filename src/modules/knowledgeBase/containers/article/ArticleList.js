import * as React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import { Alert, confirm } from 'modules/common/utils';
import gql from 'graphql-tag';
import { queries, mutations } from '../../graphql';
import { ArticleList } from '../../components';

const ArticleContainer = props => {
  const {
    articlesQuery,
    removeArticlesMutation,
    queryParams,
    currentCategoryId,
    topicIds
  } = props;

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
    currentCategoryId,
    topicIds,
    queryParams,
    articles: articlesQuery.knowledgeBaseArticles || [],
    loading: articlesQuery.loading
  };

  return <ArticleList {...extendedProps} />;
};

ArticleContainer.propTypes = {
  queryParams: PropTypes.object,
  articlesQuery: PropTypes.object,
  removeArticlesMutation: PropTypes.func,
  currentCategoryId: PropTypes.string,
  topicIds: PropTypes.string
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
    name: 'removeArticlesMutation',
    options: ({ currentCategoryId, topicIds }) => {
      return {
        refetchQueries: [
          {
            query: gql(queries.knowledgeBaseArticlesTotalCount),
            variables: { categoryIds: [currentCategoryId] }
          },
          {
            query: gql(queries.knowledgeBaseCategories),
            variables: { topicIds: [topicIds] }
          },
          {
            query: gql(queries.knowledgeBaseCategoryDetail),
            variables: { _id: currentCategoryId }
          }
        ]
      };
    }
  })
)(ArticleContainer);
