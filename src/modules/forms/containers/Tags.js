import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { queries } from '../graphql';
import { CountsByTag, Spinner } from 'modules/common/components';

const TagContainer = props => {
  const { countsQuery } = props;

  if (countsQuery.loading) {
    return <Spinner />;
  }

  const updatedProps = {
    ...props,
    counts: countsQuery.integrationsTotalCount.byTag || {},
    loading: countsQuery.loading
  };

  return <CountsByTag {...updatedProps} />;
};

TagContainer.propTypes = {
  countsQuery: PropTypes.object,
  loading: PropTypes.bool
};

export default compose(
  graphql(gql(queries.integrationsCount), {
    name: 'countsQuery'
  })
)(TagContainer);
