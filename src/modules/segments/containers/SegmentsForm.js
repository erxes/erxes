import React from 'react';
import PropTypes from 'prop-types';
import { Alert } from 'modules/common/utils';
import { compose, gql, graphql } from 'react-apollo';
import { SegmentsForm } from '../components';
import { mutations, queries } from '../graphql';

const SegmentsFormContainer = props => {
  const {
    contentType,
    segmentDetailQuery,
    headSegmentsQuery,
    combinedFieldsQuery,
    segmentsAdd,
    segmentsEdit,
    history
  } = props;

  if (
    segmentDetailQuery.loading ||
    headSegmentsQuery.loading ||
    combinedFieldsQuery.loading
  ) {
    return null;
  }

  const fields = combinedFieldsQuery.fieldsCombinedByContentType.map(
    ({ name, label }) => ({
      _id: name,
      title: label,
      selectedBy: 'none'
    })
  );

  const segment = segmentDetailQuery.segmentDetail;
  const headSegments = headSegmentsQuery.segmentsGetHeads;

  const create = ({ doc }) => {
    segmentsAdd({ variables: { contentType, ...doc } }).then(() => {
      Alert.success('Success');
      history.push(`/segments/${contentType}`);
    });
  };

  const edit = ({ id, doc }) => {
    segmentsEdit({ variables: { _id: id, ...doc } }).then(() => {
      Alert.success('Success');
      history.push(`/segments/${contentType}`);
    });
  };

  const updatedProps = {
    ...props,
    fields,
    segment,
    headSegments,
    create,
    edit
  };

  return <SegmentsForm {...updatedProps} />;
};

SegmentsFormContainer.propTypes = {
  contentType: PropTypes.string,
  history: PropTypes.object,
  segmentDetailQuery: PropTypes.object,
  headSegmentsQuery: PropTypes.object,
  combinedFieldsQuery: PropTypes.object,
  segmentsAdd: PropTypes.func,
  segmentsEdit: PropTypes.func
};

export default compose(
  graphql(gql(queries.segmentDetail), {
    name: 'segmentDetailQuery',
    options: ({ id }) => ({
      variables: { _id: id }
    })
  }),
  graphql(gql(queries.headSegments), { name: 'headSegmentsQuery' }),
  graphql(gql(queries.combinedFields), {
    name: 'combinedFieldsQuery',
    options: ({ contentType }) => ({
      variables: { contentType }
    })
  }),
  // mutations
  graphql(gql(mutations.segmentsAdd), {
    name: 'segmentsAdd'
  }),
  graphql(gql(mutations.segmentsEdit), {
    name: 'segmentsEdit'
  })
)(SegmentsFormContainer);
