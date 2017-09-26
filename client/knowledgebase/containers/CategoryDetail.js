/* eslint-disable react/jsx-filename-extension */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { CategoryDetail as DumbCategoryDetail } from '../components';
import queries from './graphql';

const propTypes = {
  data: PropTypes.shape({
    knowledgeBaseCategoriesDetail: PropTypes.object,
    loading: PropTypes.bool,
  }),
};

const CategoryDetail = (props) => {
  const extendedProps = {
    ...props,
    category: props.data.knowledgeBaseCategoriesDetail,
  };

  if (props.data.loading) {
    return null;
  }

  return <DumbCategoryDetail {...extendedProps} />;
};

CategoryDetail.propTypes = propTypes;

const CategoryDetailWithData = graphql(
  gql(queries.getKbCategoryQuery),
  {
    options: (ownProps) => ({
      fetchPolicy: 'network-only',
      variables: {
        categoryId: ownProps.category._id,
      },
    })
  },
)(CategoryDetail);

export default connect()(CategoryDetailWithData);
