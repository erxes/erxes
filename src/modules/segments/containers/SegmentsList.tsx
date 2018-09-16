import gql from 'graphql-tag';
import { Alert } from 'modules/common/utils';
import { confirm } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { SegmentsList } from '../components';
import { mutations, queries } from '../graphql';

type Props = {
  object: any,
  segmentsQuery: any,
  removeMutation: (params: { variables: { _id: string } }) => any
};

const SegmentListContainer = (props: Props) => {
  const { segmentsQuery, removeMutation } = props;

  const removeSegment = _id => {
    confirm().then(() => {
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
    });
  };

  const updatedProps = {
    ...props,
    segments: segmentsQuery.segments || [],
    removeSegment
  };

  return <SegmentsList {...updatedProps} />;
};

export default compose(
  graphql(gql(queries.segments), {
    name: 'segmentsQuery',
    options: ({ contentType }: { contentType: string }) => ({
      fetchPolicy: 'network-only',
      variables: { contentType }
    })
  }),

  graphql(gql(mutations.segmentsRemove), {
    name: 'removeMutation'
  })
)(SegmentListContainer);
