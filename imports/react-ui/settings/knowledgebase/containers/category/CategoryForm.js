import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { Loading } from '/imports/react-ui/common';
import { queries } from '../../graphql';
import { CategoryForm } from '../../components';

const addPropTypes = {
  getArticleListQuery: PropTypes.object.isRequired,
  save: PropTypes.func.isRequired,
};

const editPropTypes = {
  getCategoryDetailQuery: PropTypes.object.isRequired,
  getArticleListQuery: PropTypes.object.isRequired,
  save: PropTypes.func.isRequired,
};

const CategoryEditFormContainer = props => {
  const { getCategoryDetailQuery, getArticleListQuery } = props;

  if (getArticleListQuery.loading || getCategoryDetailQuery.loading) {
    return <Loading title="Category Detail" sidebarSize="wide" spin hasRightSideBar />;
  }

  const updatedProps = {
    ...props,
    object: {
      ...getCategoryDetailQuery.knowledgeBaseCategoriesDetail,
      refetch: getCategoryDetailQuery.refetch,
    },
    articles: getArticleListQuery.knowledgeBaseArticles,
  };
  return <CategoryForm {...updatedProps} />;
};

CategoryEditFormContainer.propTypes = editPropTypes;

const CategoryAddFormContainer = props => {
  const { getArticleListQuery } = props;

  if (getArticleListQuery.loading) {
    return <Loading title="Category Detail" sidebarSize="wide" spin hasRightSideBar />;
  }

  const updatedProps = {
    ...props,
    articles: getArticleListQuery.knowledgeBaseArticles,
  };
  return <CategoryForm {...updatedProps} />;
};

CategoryAddFormContainer.propTypes = addPropTypes;

const categoryFormComposer = options => {
  const { object } = options;

  if (object && object._id) {
    return compose(
      graphql(gql(queries.getCategoryDetail), {
        name: 'getCategoryDetailQuery',
        options: params => {
          return {
            variables: {
              _id: params.object._id,
            },
          };
        },
      }),
      graphql(gql(queries.getArticleList), {
        name: 'getArticleListQuery',
        options: () => ({
          fetchPolicy: 'network-only',
        }),
      }),
    )(CategoryEditFormContainer);
  }

  return compose(
    graphql(gql(queries.getArticleList), {
      name: 'getArticleListQuery',
      options: () => ({
        fetchPolicy: 'network-only',
      }),
    }),
  )(CategoryAddFormContainer);
};

export default categoryFormComposer;
