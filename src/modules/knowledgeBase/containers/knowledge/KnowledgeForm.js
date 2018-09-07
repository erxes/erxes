import * as React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import { queries } from '../../graphql';
import { KnowledgeForm } from '../../components';

const addPropTypes = {
  getBrandListQuery: PropTypes.object.isRequired,
  save: PropTypes.func.isRequired
};

const TopicAddFormContainer = ({ getBrandListQuery, ...props }) => {
  if (getBrandListQuery.loading) {
    return <Spinner objective />;
  }

  const updatedProps = {
    ...props,
    brands: getBrandListQuery.brands || []
  };
  return <KnowledgeForm {...updatedProps} />;
};

TopicAddFormContainer.propTypes = addPropTypes;

export default compose(
  graphql(gql(queries.getBrandList), {
    name: 'getBrandListQuery',
    options: () => ({
      fetchPolicy: 'network-only'
    })
  })
)(TopicAddFormContainer);
