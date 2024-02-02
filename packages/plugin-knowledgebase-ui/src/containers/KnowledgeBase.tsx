import * as compose from 'lodash.flowright';

import {
  ArticlesTotalCountQueryResponse,
  CategoryDetailQueryResponse,
  ICategory,
  LastCategoryQueryResponse,
} from '@erxes/ui-knowledgebase/src/types';
import { router as routerUtils, withProps } from '@erxes/ui/src/utils';

import { IRouterProps } from '@erxes/ui/src/types';
// import { withRouter } from 'react-router-dom';
import KnowledgeBaseComponent from '../components/KnowledgeBase';
import React, { useEffect } from 'react';
import { gql, useQuery } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { queries } from '@erxes/ui-knowledgebase/src/graphql';
import queryString from 'query-string';

type Props = {
  queryParams: any;
  currentCategoryId: string;
} & IRouterProps;

const KnowledgeBaseContainer = (props: Props) => {
  const { currentCategoryId } = props;

  const categoryDetailQuery = useQuery<CategoryDetailQueryResponse>(
    gql(queries.knowledgeBaseCategoryDetail),
    {
      variables: { _id: currentCategoryId },
      fetchPolicy: 'network-only',
    },
  );

  const articlesCountQuery = useQuery<ArticlesTotalCountQueryResponse>(
    gql(queries.knowledgeBaseArticlesTotalCount),
    {
      variables: { categoryIds: [currentCategoryId] },
      skip: !currentCategoryId,
    },
  );

  const articlesCount =
    articlesCountQuery &&
    articlesCountQuery?.data?.knowledgeBaseArticlesTotalCount;

  const currentCategory =
    categoryDetailQuery &&
    categoryDetailQuery?.data?.knowledgeBaseCategoryDetail;

  const updatedProps = {
    ...props,
    articlesCount: articlesCount || 0,
    currentCategory: currentCategory || ({} as ICategory),
  };

  return <KnowledgeBaseComponent {...updatedProps} />;
};

type WithCurrentIdProps = {
  history: any;
  queryParams: any;
} & IRouterProps;

const WithLastCategory = (props: WithCurrentIdProps) => {
  const { queryParams, history } = props;

  const lastCategoryQuery = useQuery<LastCategoryQueryResponse>(
    gql(queries.categoriesGetLast),
    {
      skip: queryParams.id,
      fetchPolicy: 'network-only',
    },
  );

  useEffect(() => {
    if (!lastCategoryQuery) {
      return;
    }

    if (
      !queryParams._id &&
      lastCategoryQuery?.data?.knowledgeBaseCategoriesGetLast &&
      !lastCategoryQuery.loading
    ) {
      routerUtils.setParams(
        history,
        {
          id: lastCategoryQuery?.data?.knowledgeBaseCategoriesGetLast._id,
        },
        true,
      );
    }
  }, [lastCategoryQuery?.data]);

  const updatedProps = {
    ...props,
    currentCategoryId: queryParams.id || '',
  };

  return <KnowledgeBaseContainer {...updatedProps} />;
};

const WithQueryParams = (props: IRouterProps) => {
  const { location } = props;
  const queryParams = queryString.parse(location.search);

  const extendedProps = { ...props, queryParams };

  return <WithLastCategory {...extendedProps} />;
};

export default WithQueryParams;

// export default withRouter<IRouterProps>(WithQueryParams);
