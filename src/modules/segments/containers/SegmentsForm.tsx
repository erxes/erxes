import gql from 'graphql-tag';
import ButtonMutate from 'modules/common/components/ButtonMutate';
import { IButtonMutateProps } from 'modules/common/types';
import { Alert, withProps } from 'modules/common/utils';
import { queries as companyQueries } from 'modules/companies/graphql';
import { queries as customerQueries } from 'modules/customers/graphql';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import { CountQueryResponse as CompanyCountQueryResponse } from '../../companies/types';
import { CountQueryResponse as CustomerCountQueryResponse } from '../../customers/types';
import { FieldsCombinedByTypeQueryResponse } from '../../settings/properties/types';
import SegmentsForm from '../components/SegmentsForm';
import { mutations, queries } from '../graphql';
import {
  AddMutationResponse,
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
  renderButton = ({
    name,
    values,
    isSubmitted,
    callback,
    object
  }: IButtonMutateProps) => {
    const { contentType, history } = this.props;

    const callBackResponse = () => {
      history.push(`/segments/${contentType}`);

      if (callback) {
        callback();
      }
    };

    return (
      <ButtonMutate
        mutation={object ? mutations.segmentsEdit : mutations.segmentsAdd}
        variables={values}
        callback={callBackResponse}
        refetchQueries={getRefetchQueries(contentType)}
        isSubmitted={isSubmitted}
        btnSize="small"
        type="submit"
        successMessage={`You successfully ${
          object ? 'updated' : 'added'
        } a ${name}`}
      />
    );
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
      ({ name, label, brandName, brandId }) => ({
        _id: name,
        title: label,
        brandName,
        brandId,
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
      renderButton: this.renderButton,
      count: this.count,
      counterLoading: counts.loading,
      total: counts[`${contentType}Counts`] || {}
    };

    return <SegmentsForm {...updatedProps} />;
  }
}

const getRefetchQueries = (contentType: string) => {
  return [
    {
      query: gql(generateRefetchQuery({ contentType })),
      variables: { only: 'bySegment' }
    }
  ];
};

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
    })
  )(SegmentsFormContainer)
);
