import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { Loader } from 'modules/common/components';
import { Alert } from 'modules/common/utils';
import { SegmentsList } from '../components';
import { queries, mutations } from '../graphql';

const SegmentListContainer = props => {
  const { segmentsQuery, removeMutation } = props;

  if (segmentsQuery.loading) {
    return <Loader />;
  }

  const removeSegment = _id => {
    // TODO confirm
    removeMutation({
      variables: { _id }
    })
      .then(() => {
        segmentsQuery.refetch();

        Alert.success('Congrats');
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  const updatedProps = {
    ...props,
    segments: segmentsQuery.segments,
    removeSegment
  };

  return <SegmentsList {...updatedProps} />;
};

SegmentListContainer.propTypes = {
  object: PropTypes.object,
  segmentsQuery: PropTypes.object,
  removeMutation: PropTypes.func
};

export default compose(
  graphql(gql(queries.segments), {
    name: 'segmentsQuery',
    options: ({ contentType }) => ({
      fetchPolicy: 'network-only',
      variables: { contentType }
    })
  }),

  graphql(gql(mutations.segmentsRemove), {
    name: 'removeMutation'
  })
)(SegmentListContainer);
