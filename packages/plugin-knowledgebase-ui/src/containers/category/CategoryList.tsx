import { Alert, confirm } from '@erxes/ui/src/utils';
import {
  CategoriesQueryResponse,
  CategoriesTotalCountQueryResponse,
  RemoveCategoriesMutationResponse,
} from '@erxes/ui-knowledgebase/src/types';
import { mutations, queries } from '@erxes/ui-knowledgebase/src/graphql';

import CategoryList from '../../components/category/CategoryList';
import React from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';

type Props = {
  currentCategoryId: string;
  topicId: string;
  queryParams?: any;
};

const KnowledgeBaseContainer = (props: Props) => {
  const { currentCategoryId, topicId, queryParams } = props;

  const categoriesQuery = useQuery<CategoriesQueryResponse>(
    gql(queries.knowledgeBaseCategories),
    {
      variables: {
        topicIds: [topicId],
      },
    },
  );

  const categoriesCountQuery = useQuery<CategoriesTotalCountQueryResponse>(
    gql(queries.knowledgeBaseCategoriesTotalCount),
    {
      variables: {
        topicIds: [topicId],
      },
    },
  );

  const [removeCategoriesMutation] =
    useMutation<RemoveCategoriesMutationResponse>(
      gql(mutations.knowledgeBaseCategoriesRemove),
      {
        refetchQueries: refetchQueries(currentCategoryId),
      },
    );

  // remove action
  const remove = (categoryId) => {
    confirm().then(() => {
      removeCategoriesMutation({
        variables: { _id: categoryId },
      })
        .then(() => {
          categoriesQuery.refetch();

          Alert.success('You successfully deleted a category');
        })
        .catch((error) => {
          Alert.error(error.message);
        });
    });
  };

  const extendedProps = {
    ...props,
    remove,
    currentCategoryId,
    topicId,
    categoriesQuery,
    queryParams,
    categories: categoriesQuery?.data?.knowledgeBaseCategories || [],
    loading: categoriesQuery.loading,
    topicsCount:
      categoriesCountQuery?.data?.knowledgeBaseCategoriesTotalCount || 0,
  };

  return <CategoryList {...extendedProps} />;
};

const refetchQueries = (currentCategoryId: string) => {
  const refetchQueries: any[] = [
    {
      query: gql(queries.knowledgeBaseCategories),
    },
    {
      query: gql(queries.knowledgeBaseTopics),
    },
  ];

  if (currentCategoryId) {
    refetchQueries.push({
      query: gql(queries.knowledgeBaseArticlesTotalCount),
      variables: { categoryIds: [currentCategoryId] },
    });

    refetchQueries.push({
      query: gql(queries.knowledgeBaseCategoryDetail),
      variables: { _id: currentCategoryId },
      skip: () => !currentCategoryId,
    });
  }

  return refetchQueries;
};

export default KnowledgeBaseContainer;
