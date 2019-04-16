import gql from 'graphql-tag';
import { __, Alert, withProps } from 'modules/common/utils';
import { generatePaginationParams } from 'modules/common/utils/router';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { ArticleForm } from '../../components';
import { mutations, queries } from '../../graphql';
import {
  AddArticlesMutationResponse,
  ArticleVariables,
  EditArticlesMutationResponse,
  IArticle
} from '../../types';

type Props = {
  article: IArticle;
  currentCategoryId: string;
  queryParams: any;
  topicIds: string[];
  closeModal: () => void;
};

type FinalProps = Props &
  AddArticlesMutationResponse &
  EditArticlesMutationResponse;

const ArticleContainer = (props: FinalProps) => {
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
        Alert.success(
          __(`You successfully ${object ? 'updated' : 'added'} an article`)
        );

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
          ...generatePaginationParams(queryParams),
          categoryIds: [currentCategoryId]
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

export default withProps<Props>(
  compose(
    graphql<Props, EditArticlesMutationResponse, ArticleVariables>(
      gql(mutations.knowledgeBaseArticlesEdit),
      {
        name: 'editArticlesMutation',
        options: commonOptions
      }
    ),
    graphql<Props, AddArticlesMutationResponse, ArticleVariables>(
      gql(mutations.knowledgeBaseArticlesAdd),
      {
        name: 'addArticlesMutation',
        options: commonOptions
      }
    )
  )(ArticleContainer)
);
