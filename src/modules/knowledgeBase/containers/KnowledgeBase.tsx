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
  articlesCountQuery: any;
  categoryDetailQuery: any;
}

class KnowledgeBase extends React.Component<IProps> {
  componentWillReceiveProps() {
    const { history, currentCategoryId } = this.props;

    if (!routerUtils.getParam(history, 'id') && currentCategoryId) {
      routerUtils.setParams(history, { id: currentCategoryId });
    }
  }

  render() {
    const { categoryDetailQuery, location, articlesCountQuery } = this.props;

    if (categoryDetailQuery.loading) {
      return false;
    }

    const extendedProps = {
      ...this.props,
      queryParams: queryString.parse(location.search),
      currentCategory: categoryDetailQuery.knowledgeBaseCategoryDetail || {},
      loading: categoryDetailQuery.loading,
      refetch: categoryDetailQuery.refetch,
      articlesCount: articlesCountQuery.knowledgeBaseArticlesTotalCount || 0
    };

    return <KnowledgeBaseComponent {...extendedProps} />;
  }
}

const KnowledgeBaseContainer = compose(
  graphql(gql(queries.knowledgeBaseCategoryDetail), {
    name: 'categoryDetailQuery',
    options: ({ currentCategoryId }: { currentCategoryId: string }) => ({
      variables: { _id: currentCategoryId || '' },
      fetchPolicy: 'network-only'
    })
  }),
  graphql(gql(queries.knowledgeBaseArticlesTotalCount), {
    name: 'articlesCountQuery',
    options: ({ currentCategoryId }: { currentCategoryId: string }) => ({
      variables: { categoryIds: [currentCategoryId] || '' }
    })
  })
)(KnowledgeBase);

type KnowledgeBaseLastProps = {
  lastCategoryQuery: any;
};

const KnowledgeBaseLast = (props: KnowledgeBaseLastProps) => {
  const { lastCategoryQuery } = props;
  const lastCategory = lastCategoryQuery.knowledgeBaseCategoriesGetLast || {};
  const extendedProps = { ...props, currentCategoryId: lastCategory._id };

  return <KnowledgeBaseContainer {...extendedProps} />;
};

const KnowledgeBaseLastContainer = compose(
  graphql(gql(queries.categoriesGetLast), {
    name: 'lastCategoryQuery'
  })
)(KnowledgeBaseLast);

const MainContainer = (props: IRouterProps) => {
  const { history } = props;
  const currentCategoryId = routerUtils.getParam(history, 'id');

  if (currentCategoryId) {
    const extendedProps = { ...props, currentCategoryId };

    return <KnowledgeBaseContainer {...extendedProps} />;
  }

  return <KnowledgeBaseLastContainer {...props} />;
};

export default withRouter<IRouterProps>(MainContainer);
