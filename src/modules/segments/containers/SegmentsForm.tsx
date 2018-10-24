import gql from 'graphql-tag';
import { Alert } from 'modules/common/utils';
import { queries as companyQueries } from 'modules/companies/graphql';
import { queries as customerQueries } from 'modules/customers/graphql';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { SegmentsForm } from '../components';
import { mutations, queries } from '../graphql';
import { ISegmentCondition } from '../types';

type Variables = {
  name: string;
  description: string;
  subOf: string;
  color: string;
  connector: string;
  conditions: ISegmentCondition[];
};

type Props = {
  contentType: string;
  history: any;
  segmentDetailQuery: any;
  headSegmentsQuery: any;
  combinedFieldsQuery: any;

  segmentsAdd: (
    params: { variables: { contentType: string; doc: Variables } }
  ) => Promise<any>;
  segmentsEdit: (
    params: { variables: { _id: string; doc: Variables } }
  ) => Promise<any>;

  counts: any;
};

class SegmentsFormContainer extends React.Component<Props> {
  create = ({ doc }) => {
    const { contentType, segmentsAdd, history } = this.props;

    segmentsAdd({ variables: { contentType, ...doc } }).then(() => {
      Alert.success('Success');
      history.push(`/segments/${contentType}`);
    });
  }

  edit = ({ _id, doc }) => {
    const { contentType, segmentsEdit, history } = this.props;

    segmentsEdit({ variables: { _id, ...doc } }).then(() => {
      Alert.success('Success');
      history.push(`/segments/${contentType}`);
    });
  }

  count = (segment) => {
    const { counts } = this.props;

    counts.refetch({ byFakeSegment: segment });
  }

  render() {
    const {
      contentType,
      segmentDetailQuery,
      headSegmentsQuery,
      combinedFieldsQuery,
      counts
    } = this.props;

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

    const updatedProps = {
      ...this.props,
      fields,
      segment,
      headSegments: headSegments.filter(s => s.contentType === contentType),
      create: this.create,
      count: this.count,
      total: counts[`${contentType}Counts`] || {},
      edit: this.edit
    };

    return <SegmentsForm {...updatedProps} />;
  }
}

export default compose(
  graphql(gql(queries.segmentDetail), {
    name: 'segmentDetailQuery',
    options: ({ id }: { id: string }) => ({
      variables: { _id: id }
    })
  }),
  graphql(gql(customerQueries.customerCounts), {
    name: 'counts',
    skip: ({ contentType }: { contentType: string }) => {
      return contentType === 'company';
    }
  }),
  graphql(gql(companyQueries.companyCounts), {
    name: 'counts',
    skip: ({ contentType }: { contentType: string }) => {
      return contentType === 'customer';
    }
  }),
  graphql(gql(queries.headSegments), { name: 'headSegmentsQuery' }),
  graphql(gql(queries.combinedFields), {
    name: 'combinedFieldsQuery',
    options: ({ contentType }: { contentType: string }) => ({
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
