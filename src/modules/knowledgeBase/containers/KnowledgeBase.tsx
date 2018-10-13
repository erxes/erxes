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
  articlesCountQuery: any;
  categoryDetailQuery: any;
  lastCategoryQuery: any;
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

  if (lastCategoryQuery.loading) {
    return null;
  }

  const lastCategory = lastCategoryQuery.knowledgeBaseCategoriesGetLast;
  const articlesCount = articlesCountQuery.knowledgeBaseArticlesTotalCount || 0;
  const currentCategory = categoryDetailQuery.knowledgeBaseCategoryDetail || {};

  let updatedProps = {
    ...props,
    articlesCount,
    currentCategory,
    currentCategoryId: currentCategory._id || ''
  };

  if (!queryParams.id) {
    routerUtils.setParams(history, { id: lastCategory._id });

    updatedProps = {
      ...props,
      articlesCount,
      currentCategory: lastCategory,
      currentCategoryId: lastCategory._id
    };
  }

  return <KnowledgeBaseComponent {...updatedProps} />;
};

export default compose(
  graphql(gql(queries.knowledgeBaseCategoryDetail), {
    name: 'categoryDetailQuery',
    options: ({ queryParams }: { queryParams: any }) => ({
      variables: { _id: queryParams.id || '' },
      fetchPolicy: 'network-only'
    })
  }),
  graphql(gql(queries.knowledgeBaseArticlesTotalCount), {
    name: 'articlesCountQuery',
    options: ({ queryParams }: { queryParams: any }) => ({
      variables: { categoryIds: [queryParams.id] || [''] }
    })
  }),
  graphql(gql(queries.categoriesGetLast), {
    name: 'lastCategoryQuery'
  })
)(withRouter<IProps>(KnowledgeBase));
