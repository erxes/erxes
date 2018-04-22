import React from 'react';
import PropTypes from 'prop-types';
import { Alert } from 'modules/common/utils';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { SegmentsForm } from '../components';
import { mutations, queries } from '../graphql';
import { queries as customerQueries } from 'modules/customers/graphql';

const SegmentsFormContainer = props => {
  const {
    contentType,
    segmentDetailQuery,
    headSegmentsQuery,
    combinedFieldsQuery,
    segmentsAdd,
    segmentsEdit,
    history,
    customerCounts
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

  const count = segment => {
    customerCounts.refetch({
      byFakeSegment: segment
    });
  };

  const updatedProps = {
    ...props,
    fields,
    segment,
    headSegments: headSegments.filter(s => s.contentType === contentType),
    create,
    count,
    total: customerCounts.customerCounts || {},
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
  segmentsEdit: PropTypes.func,
  customerCounts: PropTypes.object
};

export default compose(
  graphql(gql(queries.segmentDetail), {
    name: 'segmentDetailQuery',
    options: ({ id }) => ({
      variables: { _id: id }
    })
  }),
  graphql(gql(customerQueries.customerCounts), {
    name: 'customerCounts'
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
