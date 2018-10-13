import gql from 'graphql-tag';
import { IRouterProps } from 'modules/common/types';
import { router as routerUtils } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router';
import { KnowledgeBase as KnowledgeBaseComponent } from '../components';
import { queries } from '../graphql';

interface IProps extends IRouterProps {
  currentCategoryId: string;
  articlesCountQuery?: any;
  categoryDetailQuery?: any;
  lastCategoryQuery?: any;
  queryParams: any;
}

const KnowledgeBase = (props: IProps) => {
  const {
    categoryDetailQuery,
    articlesCountQuery,
    lastCategoryQuery,
    queryParams,
    history
  } = props;

  const lastCategory =
    lastCategoryQuery && lastCategoryQuery.knowledgeBaseCategoriesGetLast;

  if (!queryParams.id && lastCategory) {
    routerUtils.setParams(history, { id: lastCategory._id });
  }

  const articlesCount =
    (articlesCountQuery &&
      articlesCountQuery.knowledgeBaseArticlesTotalCount) ||
    0;

  const currentCategory =
    (categoryDetailQuery && categoryDetailQuery.knowledgeBaseCategoryDetail) ||
    {};

  const updatedProps = {
    ...props,
    articlesCount,
    currentCategory,
    currentCategoryId: currentCategory._id || ''
  };

  return <KnowledgeBaseComponent {...updatedProps} />;
};

export default compose(
  graphql(gql(queries.knowledgeBaseCategoryDetail), {
    name: 'categoryDetailQuery',
    options: ({ queryParams }: { queryParams: any }) => ({
      variables: { _id: queryParams.id || '' },
      fetchPolicy: 'network-only'
    }),
    skip: ({ queryParams }) => !queryParams.id
  }),
  graphql(gql(queries.knowledgeBaseArticlesTotalCount), {
    name: 'articlesCountQuery',
    options: ({ queryParams }: { queryParams: any }) => ({
      variables: { categoryIds: [queryParams.id] || [''] }
    }),
    skip: ({ queryParams }) => !queryParams.id
  }),
  graphql(gql(queries.categoriesGetLast), {
    name: 'lastCategoryQuery',
    skip: ({ queryParams }) => queryParams.id
  })
)(withRouter<IProps>(KnowledgeBase));
