import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { Filter } from '../components';
import { queries } from '../graphql';

const FilterContainer = props => {
  const { segmentsQuery } = props;

  if (segmentsQuery.loading) {
    return null;
  }

  const updatedProps = {
    ...props,
    segments: segmentsQuery.segments
  };

  return <Filter {...updatedProps} />;
};

FilterContainer.propTypes = {
  segmentsQuery: PropTypes.object
};

export default compose(
  graphql(gql(queries.segments), {
    name: 'segmentsQuery',
    options: ({ contentType }) => ({
      variables: { contentType }
    })
  })
)(FilterContainer);
