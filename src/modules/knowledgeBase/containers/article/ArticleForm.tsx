import gql from 'graphql-tag';
import { Alert } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { ArticleForm } from '../../components';
import { mutations, queries } from '../../graphql';
import { IArticle } from '../../types';

type Props = {
  article: IArticle,
  addArticlesMutation: (params: { variables: any }) => any,
  editArticlesMutation: (params: { variables: any }) => any,
  currentCategoryId: string
};

const ArticleContainer = (props: Props) => {
  const {
    article,
    addArticlesMutation,
    editArticlesMutation,
    currentCategoryId
  } = props;

  // create or update action
  const save = ({ doc }, callback, object) => {
    let mutation = addArticlesMutation;

    // if edit mode
    if (object) {
      mutation = editArticlesMutation;
      doc._id = object._id;
    }

    mutation({
      variables: doc
    })
      .then(() => {
        Alert.success('Congrats');

        callback();
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  const extendedProps = {
    ...props,
    save,
    article,
    currentCategoryId
  };

  return <ArticleForm {...extendedProps} />;
};

const commonOptions = ({ queryParams, currentCategoryId, topicIds }) => {
  return {
    refetchQueries: [
      {
        query: gql(queries.knowledgeBaseArticles),
        variables: {
          categoryIds: [currentCategoryId],
          page: queryParams.page,
          perPage: queryParams.perPage || 20
        }
      },
      {
        query: gql(queries.knowledgeBaseCategories),
        variables: { topicIds: [topicIds] }
      },
      {
        query: gql(queries.knowledgeBaseArticlesTotalCount),
        variables: { categoryIds: [currentCategoryId] }
      }
    ]
  };
};

export default compose(
  graphql(gql(mutations.knowledgeBaseArticlesEdit), {
    name: 'editArticlesMutation',
    options: commonOptions
  }),
  graphql(gql(mutations.knowledgeBaseArticlesAdd), {
    name: 'addArticlesMutation',
    options: commonOptions
  })
)(ArticleContainer);
