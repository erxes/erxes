import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { Spinner } from 'modules/common/components';
import { queries } from '../../graphql';
import { TopicForm } from '../../components';

const addPropTypes = {
  getCategoryListQuery: PropTypes.object.isRequired,
  getBrandListQuery: PropTypes.object.isRequired,
  save: PropTypes.func.isRequired
};

const TopicAddFormContainer = ({
  getBrandListQuery,
  getCategoryListQuery,
  ...props
}) => {
  if (getBrandListQuery.loading || getCategoryListQuery.loading) {
    return <Spinner />;
  }

  const updatedProps = {
    ...props,
    brands: getBrandListQuery.brands,
    categories: getCategoryListQuery.knowledgeBaseCategories
  };
  return <TopicForm {...updatedProps} />;
};

TopicAddFormContainer.propTypes = addPropTypes;

export default compose(
  graphql(gql(queries.knowledgeBaseCategories), {
    name: 'getCategoryListQuery',
    options: () => ({
      fetchPolicy: 'network-only'
    })
  }),
  graphql(gql(queries.getBrandList), {
    name: 'getBrandListQuery',
    options: () => ({
      fetchPolicy: 'network-only'
    })
  })
)(TopicAddFormContainer);
