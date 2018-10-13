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

  let updatedProps: any = {
    articlesCount: articlesCountQuery.knowledgeBaseArticlesTotalCount || 0
  };

  if (!queryParams.id) {
    routerUtils.setParams(history, { id: lastCategory._id });

    updatedProps = {
      ...props,
      currentCategory: lastCategory,
      currentCategoryId: lastCategory._id
    };
  }

  const currentCategory = categoryDetailQuery.knowledgeBaseCategoryDetail || {};

  updatedProps = {
    ...props,
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
