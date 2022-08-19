import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { generatePaginationParams } from '@erxes/ui/src/utils/router';
import React from 'react';
import { graphql } from 'react-apollo';
import ArticleForm from '../../components/article/ArticleForm';
import { mutations, queries } from '@erxes/ui-knowledgebase/src/graphql';
import {
  IArticle,
  TopicsQueryResponse
} from '@erxes/ui-knowledgebase/src/types';

type Props = {
  article: IArticle;
  currentCategoryId: string;
  queryParams: any;
  topicIds: string[];
  closeModal: () => void;
};

type FinalProps = {
  topicsQuery: TopicsQueryResponse;
} & Props;

const ArticleContainer = (props: FinalProps) => {
  const {
    article,
    queryParams,
    topicIds,
    currentCategoryId,
    topicsQuery
  } = props;

  const renderButton = ({
    name,
    values,
    isSubmitted,
    callback,
    object
  }: IButtonMutateProps) => {
    return (
      <ButtonMutate
        mutation={
          object
            ? mutations.knowledgeBaseArticlesEdit
            : mutations.knowledgeBaseArticlesAdd
        }
        variables={values}
        callback={callback}
        refetchQueries={getRefetchQueries(
          queryParams,
          currentCategoryId,
          topicIds
        )}
        type="submit"
        isSubmitted={isSubmitted}
        successMessage={`You successfully ${
          object ? 'updated' : 'added'
        } an ${name}`}
      />
    );
  };

  const extendedProps = {
    ...props,
    renderButton,
    article,
    currentCategoryId,
    topics: topicsQuery.knowledgeBaseTopics || []
  };

  return <ArticleForm {...extendedProps} />;
};

const getRefetchQueries = (
  queryParams,
  currentCategoryId: string,
  topicIds: string[]
) => {
  return [
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
  ];
};

export default compose(
  graphql<Props, TopicsQueryResponse>(gql(queries.knowledgeBaseTopics), {
    name: 'topicsQuery',
    options: () => ({
      fetchPolicy: 'network-only'
    })
  })
)(ArticleContainer);
