import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { IRouterProps } from 'modules/common/types';
import { router as routerUtils, withProps } from 'modules/common/utils';
import queryString from 'query-string';
import React from 'react';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router';
import KnowledgeBaseComponent from '../components/KnowledgeBase';
import { queries } from '../graphql';
import {
  ArticlesTotalCountQueryResponse,
  CategoryDetailQueryResponse,
  ICategory,
  LastCategoryQueryResponse
} from '../types';

type Props = {
  queryParams: any;
  currentCategoryId: string;
};

type FinalProps = {
  articlesCountQuery?: ArticlesTotalCountQueryResponse;
  categoryDetailQuery?: CategoryDetailQueryResponse;
} & Props &
  IRouterProps;

const KnowledgeBase = (props: FinalProps) => {
  const { categoryDetailQuery, articlesCountQuery } = props;

  const articlesCount =
    articlesCountQuery && articlesCountQuery.knowledgeBaseArticlesTotalCount;

  const currentCategory =
    categoryDetailQuery && categoryDetailQuery.knowledgeBaseCategoryDetail;

  const updatedProps = {
    ...props,
    articlesCount: articlesCount || 0,
    currentCategory: currentCategory || ({} as ICategory)
  };

  return <KnowledgeBaseComponent {...updatedProps} />;
};

const KnowledgeBaseContainer = withProps<Props>(
  compose(
    graphql<Props, CategoryDetailQueryResponse, { _id: string }>(
      gql(queries.knowledgeBaseCategoryDetail),
      {
        name: 'categoryDetailQuery',
        options: ({ currentCategoryId }) => ({
          variables: { _id: currentCategoryId },
          fetchPolicy: 'network-only'
        }),
        skip: ({ currentCategoryId }) => !currentCategoryId
      }
    ),
    graphql<Props, ArticlesTotalCountQueryResponse, { categoryIds: string[] }>(
      gql(queries.knowledgeBaseArticlesTotalCount),
      {
        name: 'articlesCountQuery',
        options: ({ currentCategoryId }) => ({
          variables: { categoryIds: [currentCategoryId] }
        }),
        skip: ({ currentCategoryId }) => !currentCategoryId
      }
    )
  )(KnowledgeBase)
);

type WithCurrentIdProps = {
  history: any;
  queryParams: any;
};

type WithCurrentIdFinalProps = {
  lastCategoryQuery: LastCategoryQueryResponse;
} & WithCurrentIdProps;

class WithCurrentId extends React.Component<WithCurrentIdFinalProps> {
  componentWillReceiveProps(nextProps: WithCurrentIdFinalProps) {
    const {
      lastCategoryQuery,
      history,
      queryParams: { _id }
    } = nextProps;

    if (!lastCategoryQuery) {
      return;
    }

    const { knowledgeBaseCategoriesGetLast, loading } = lastCategoryQuery;

    if (!_id && knowledgeBaseCategoriesGetLast && !loading) {
      routerUtils.setParams(
        history,
        {
          id: knowledgeBaseCategoriesGetLast._id
        },
        true
      );
    }
  }

  render() {
    const {
      queryParams: { id }
    } = this.props;

    const updatedProps = {
      ...this.props,
      currentCategoryId: id || ''
    };

    return <KnowledgeBaseContainer {...updatedProps} />;
  }
}

const WithLastCategory = withProps<WithCurrentIdProps>(
  compose(
    graphql<WithCurrentIdProps, LastCategoryQueryResponse>(
      gql(queries.categoriesGetLast),
      {
        name: 'lastCategoryQuery',
        skip: ({ queryParams }: { queryParams: any }) => queryParams.id,
        options: () => ({ fetchPolicy: 'network-only' })
      }
    )
  )(WithCurrentId)
);

const WithQueryParams = (props: IRouterProps) => {
  const { location } = props;
  const queryParams = queryString.parse(location.search);

  const extendedProps = { ...props, queryParams };

  return <WithLastCategory {...extendedProps} />;
};

export default withProps<{}>(withRouter<IRouterProps>(WithQueryParams));
