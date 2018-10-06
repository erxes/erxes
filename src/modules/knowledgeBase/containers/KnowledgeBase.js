import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import queryString from 'query-string';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import { router as routerUtils } from 'modules/common/utils';
import { queries } from '../graphql';
import { KnowledgeBase as KnowledgeBaseComponent } from '../components';

class KnowledgeBase extends React.Component {
  componentWillReceiveProps() {
    const { history, currentCategoryId } = this.props;

    if (!routerUtils.getParam(history, 'id') && currentCategoryId) {
      routerUtils.setParams(history, { id: currentCategoryId });
    }
  }

  render() {
    const { categoryDetailQuery, location, articlesCountQuery } = this.props;
    if (categoryDetailQuery.loading) {
      return <Spinner />;
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

KnowledgeBase.propTypes = {
  currentCategoryId: PropTypes.string,
  articlesCountQuery: PropTypes.object,
  categoryDetailQuery: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object
};

const KnowledgeBaseContainer = compose(
  graphql(gql(queries.knowledgeBaseCategoryDetail), {
    name: 'categoryDetailQuery',
    options: ({ currentCategoryId }) => ({
      variables: { _id: currentCategoryId || '' },
      fetchPolicy: 'network-only'
    })
  }),
  graphql(gql(queries.knowledgeBaseArticlesTotalCount), {
    name: 'articlesCountQuery',
    options: ({ currentCategoryId }) => ({
      variables: { categoryIds: [currentCategoryId] || '' }
    })
  })
)(KnowledgeBase);

const KnowledgeBaseLast = props => {
  const { lastCategoryQuery } = props;
  const lastCategory = lastCategoryQuery.knowledgeBaseCategoriesGetLast || {};
  const extendedProps = { ...props, currentCategoryId: lastCategory._id };

  return <KnowledgeBaseContainer {...extendedProps} />;
};

KnowledgeBaseLast.propTypes = {
  lastCategoryQuery: PropTypes.object
};

const KnowledgeBaseLastContainer = compose(
  graphql(gql(queries.categoriesGetLast), {
    name: 'lastCategoryQuery'
  })
)(KnowledgeBaseLast);

const MainContainer = props => {
  const { history } = props;
  const currentCategoryId = routerUtils.getParam(history, 'id');

  if (currentCategoryId) {
    const extendedProps = { ...props, currentCategoryId };

    return <KnowledgeBaseContainer {...extendedProps} />;
  }

  return <KnowledgeBaseLastContainer {...props} />;
};

MainContainer.propTypes = {
  history: PropTypes.object
};

export default withRouter(MainContainer);
