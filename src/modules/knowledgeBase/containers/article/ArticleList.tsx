import gql from 'graphql-tag';
import { Alert, confirm } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { ArticleList } from '../../components';
import { mutations, queries } from '../../graphql';

type Props = {
  queryParams: any;
  articlesQuery: any;
  removeArticlesMutation: (
    params: { variables: { _id: string } }
  ) => Promise<any>;
  currentCategoryId: string;
  topicIds: string;
};

const ArticleContainer = (props: Props) => {
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
    ...props,
    remove,
    currentCategoryId,
    topicIds,
    queryParams,
    articles: articlesQuery.knowledgeBaseArticles || [],
    loading: articlesQuery.loading
  };

  return <ArticleList {...extendedProps} />;
};

export default compose(
  graphql(gql(queries.knowledgeBaseArticles), {
    name: 'articlesQuery',
    options: ({
      queryParams,
      currentCategoryId
    }: {
      queryParams: any;
      currentCategoryId: string;
    }) => ({
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
    options: ({
      currentCategoryId,
      topicIds
    }: {
      currentCategoryId: string;
      topicIds: string[];
    }) => {
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
