import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { Spinner } from 'modules/common/components';
import { knowledgeBaseArticles } from '../../graphql/queries';
import { CategoryForm } from '../../components';

const addPropTypes = {
  getArticleListQuery: PropTypes.object.isRequired,
  save: PropTypes.func.isRequired
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
  graphql(gql(knowledgeBaseArticles), {
    name: 'getArticleListQuery',
    options: () => ({
      fetchPolicy: 'network-only'
    })
  })
)(CategoryAddFormContainer);
