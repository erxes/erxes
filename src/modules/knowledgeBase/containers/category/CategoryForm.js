import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import { queries } from '../../graphql';
import { CategoryForm } from '../../components';

const addPropTypes = {
  getArticleListQuery: PropTypes.object.isRequired
};

const CategoryAddFormContainer = props => {
  const { getArticleListQuery } = props;

  if (getArticleListQuery.loading) {
    return <Spinner objective />;
  }

  const updatedProps = {
    ...props,
    articles: getArticleListQuery.knowledgeBaseArticles
  };
  return <CategoryForm {...updatedProps} />;
};

CategoryAddFormContainer.propTypes = addPropTypes;

export default compose(
  graphql(gql(queries.knowledgeBaseArticles), {
    name: 'getArticleListQuery',
    options: () => ({
      fetchPolicy: 'network-only'
    })
  })
)(CategoryAddFormContainer);
