import gql from 'graphql-tag';
import { IRouterProps } from 'modules/common/types';
import { router as routerUtils } from 'modules/common/utils';
import queryString from 'query-string';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router';
import { KnowledgeBase as KnowledgeBaseComponent } from '../components';
import { queries } from '../graphql';

interface IProps extends IRouterProps {
  currentCategoryId: string;
  articlesCountQuery?: any;
  categoryDetailQuery?: any;
  queryParams: any;
}

const KnowledgeBase = (props: IProps) => {
  const { categoryDetailQuery, articlesCountQuery } = props;

  const articlesCount =
    articlesCountQuery && articlesCountQuery.knowledgeBaseArticlesTotalCount;

  const currentCategory =
    categoryDetailQuery && categoryDetailQuery.knowledgeBaseCategoryDetail;

  const updatedProps = {
    ...props,
    articlesCount: articlesCount || 0,
    currentCategory: currentCategory || {}
  };

  return <KnowledgeBaseComponent {...updatedProps} />;
};

const KnowledgeBaseContainer = compose(
  graphql(gql(queries.knowledgeBaseCategoryDetail), {
    name: 'categoryDetailQuery',
    options: ({ currentCategoryId }: { currentCategoryId: string }) => ({
      variables: { _id: currentCategoryId },
      fetchPolicy: 'network-only'
    }),
    skip: ({ currentCategoryId }) => !currentCategoryId
  }),
  graphql(gql(queries.knowledgeBaseArticlesTotalCount), {
    name: 'articlesCountQuery',
    options: ({ currentCategoryId }: { currentCategoryId: string }) => ({
      variables: { categoryIds: [currentCategoryId] }
    }),
    skip: ({ currentCategoryId }) => !currentCategoryId
  })
)(KnowledgeBase);

class WithCurrentId extends React.Component<WithCurrentIdProps> {
  componentWillReceiveProps(nextProps: WithCurrentIdProps) {
    const {
      lastCategoryQuery = {},
      history,
      queryParams: { _id }
    } = nextProps;

    const { knowledgeBaseCategoriesGetLast, loading } = lastCategoryQuery;

    if (!_id && knowledgeBaseCategoriesGetLast && !loading) {
      routerUtils.setParams(history, {
        id: knowledgeBaseCategoriesGetLast._id
      });
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

type WithCurrentIdProps = {
  lastCategoryQuery: any;
  history: any;
  queryParams: any;
};

const WithLastCategory = compose(
  graphql(gql(queries.categoriesGetLast), {
    name: 'lastCategoryQuery',
    skip: ({ queryParams }: { queryParams: any }) => queryParams.id,
    options: () => ({ fetchPolicy: 'network-only' })
  })
)(WithCurrentId);

const WithQueryParams = (props: IRouterProps) => {
  const { location } = props;
  const queryParams = queryString.parse(location.search);

  const extendedProps = { ...props, queryParams };

  return <WithLastCategory {...extendedProps} />;
};

export default withRouter<IRouterProps>(WithQueryParams);
