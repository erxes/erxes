import gql from 'graphql-tag';
import { Alert, withProps } from 'modules/common/utils';
import { queries as companyQueries } from 'modules/companies/graphql';
import { queries as customerQueries } from 'modules/customers/graphql';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { CountQueryResponse as CompanyCountQueryResponse } from '../../companies/types';
import { CountQueryResponse as CustomerCountQueryResponse } from '../../customers/types';
import { FieldsCombinedByTypeQueryResponse } from '../../settings/properties/types';
import { SegmentsForm } from '../components';
import { mutations, queries } from '../graphql';
import {
  AddMutationResponse,
  AddMutationVariables,
  EditMutationResponse,
  HeadSegmentsQueryResponse,
  ISegmentDoc,
  SegmentDetailQueryResponse
} from '../types';

type Props = {
  contentType: string;
  history: any;
  id?: string;
};

type FinalProps = {
  segmentDetailQuery: SegmentDetailQueryResponse;
  headSegmentsQuery: HeadSegmentsQueryResponse;
  combinedFieldsQuery: FieldsCombinedByTypeQueryResponse;
  counts: CustomerCountQueryResponse | CompanyCountQueryResponse;
} & Props &
  AddMutationResponse &
  EditMutationResponse;

class SegmentsFormContainer extends React.Component<FinalProps> {
  create = ({ doc }) => {
    const { contentType, segmentsAdd, history } = this.props;

    if (!doc.name) {
      return Alert.error('Enter a name');
    }

    segmentsAdd({ variables: { contentType, ...doc } })
      .then(() => {
        Alert.success('You successfully added a segment');
        history.push(`/segments/${contentType}`);
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  edit = ({ _id, doc }) => {
    const { contentType, segmentsEdit, history } = this.props;

    segmentsEdit({ variables: { _id, ...doc } })
      .then(() => {
        Alert.success('You successfully updated a segment');
        history.push(`/segments/${contentType}`);
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  count = (segment: ISegmentDoc) => {
    const { counts } = this.props;

    try {
      counts.refetch({ byFakeSegment: segment });
    } catch (error) {
      Alert.error(error.message);
    }
  };

  render() {
    const {
      contentType,
      segmentDetailQuery,
      headSegmentsQuery,
      combinedFieldsQuery,
      counts
    } = this.props;

    if (segmentDetailQuery.loading || combinedFieldsQuery.loading) {
      return null;
    }

    const fields = (combinedFieldsQuery.fieldsCombinedByContentType || []).map(
      ({ name, label, brand }) => ({
        _id: name,
        title: label,
        brand,
        selectedBy: 'none'
      })
    );

    const segment = segmentDetailQuery.segmentDetail;
    const headSegments = headSegmentsQuery.segmentsGetHeads || [];

    const updatedProps = {
      ...this.props,
      fields,
      segment,
      headSegments: headSegments.filter(s => s.contentType === contentType),
      create: this.create,
      count: this.count,
      counterLoading: counts.loading,
      total: counts[`${contentType}Counts`] || {},
      edit: this.edit
    };

    return <SegmentsForm {...updatedProps} />;
  }
}

const generateRefetchQuery = ({ contentType }) => {
  if (contentType === 'customer') {
    return customerQueries.customerCounts;
  }

  return companyQueries.companyCounts;
};

export default withProps<Props>(
  compose(
    graphql<Props, SegmentDetailQueryResponse, { _id?: string }>(
      gql(queries.segmentDetail),
      {
        name: 'segmentDetailQuery',
        options: ({ id }) => ({
          variables: { _id: id }
        })
      }
    ),
    graphql<Props, CustomerCountQueryResponse>(
      gql(customerQueries.customerCounts),
      {
        name: 'counts',
        skip: ({ contentType }) => {
          return contentType === 'company';
        }
      }
    ),
    graphql<Props, CompanyCountQueryResponse>(
      gql(companyQueries.companyCounts),
      {
        name: 'counts',
        skip: ({ contentType }) => {
          return contentType === 'customer';
        }
      }
    ),
    graphql<Props, HeadSegmentsQueryResponse, { contentType: string }>(
      gql(queries.headSegments),
      {
        name: 'headSegmentsQuery'
      }
    ),
    graphql<Props>(gql(queries.combinedFields), {
      name: 'combinedFieldsQuery',
      options: ({ contentType }) => ({
        variables: { contentType }
      })
    }),
    // mutations
    graphql<Props, AddMutationResponse, AddMutationVariables>(
      gql(mutations.segmentsAdd),
      {
        name: 'segmentsAdd',
        options: ({ contentType }) => {
          return {
            refetchQueries: [
              {
                query: gql(generateRefetchQuery({ contentType })),
                variables: { only: 'bySegment' }
              }
            ]
          };
        }
      }
    ),
    graphql<
      Props,
      EditMutationResponse,
      { _id: string } & AddMutationVariables
    >(gql(mutations.segmentsEdit), {
      name: 'segmentsEdit'
    })
  )(SegmentsFormContainer)
);
