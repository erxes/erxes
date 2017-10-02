import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { Spinner } from '/imports/react-ui/common';
import { queries } from '../../graphql';
import { CategoryForm } from '../../components';

const addPropTypes = {
  getArticleListQuery: PropTypes.object.isRequired,
  save: PropTypes.func.isRequired,
};

const CategoryAddFormContainer = props => {
  const { getArticleListQuery } = props;

  if (getArticleListQuery.loading) {
    return <Spinner />;
  }

  const updatedProps = {
    ...props,
    articles: getArticleListQuery.knowledgeBaseArticles,
  };
  return <CategoryForm {...updatedProps} />;
};

CategoryAddFormContainer.propTypes = addPropTypes;

export default compose(
  graphql(gql(queries.getArticleList), {
    name: 'getArticleListQuery',
    options: () => ({
      fetchPolicy: 'network-only',
    }),
  }),
)(CategoryAddFormContainer);
