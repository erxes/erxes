import React from 'react';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { graphql } from 'react-apollo';
import { ButtonMutate, Spinner } from '@erxes/ui/src/components';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { mutations, queries } from '../graphql';
import {
  AssignmentCampaignDetailQueryResponse,
  SegmentsQueryResponse
} from '../types';
import { withProps } from '@erxes/ui/src/utils';
import { VoucherCampaignQueryResponse } from '../../voucherCampaign/types';
import { queries as voucherCampaignQueries } from '../../voucherCampaign/graphql';
import EditForm from '../components/EditForm';
import { Link } from 'react-router-dom';

type Props = {
  history: any;
  queryParams: any;
};

type FinalProps = {
  assignmentCampaignDetailQuery: AssignmentCampaignDetailQueryResponse;
  segmentsQuery: SegmentsQueryResponse;
  voucherCampaignsQuery: VoucherCampaignQueryResponse;
} & Props;

class AssignmentEditFormContainer extends React.Component<FinalProps> {
  render() {
    const {
      segmentsQuery,
      voucherCampaignsQuery,
      assignmentCampaignDetailQuery
    } = this.props;

    if (
      segmentsQuery.loading ||
      voucherCampaignsQuery.loading ||
      assignmentCampaignDetailQuery.loading
    ) {
      return <Spinner />;
    }
    const renderButton = ({
      name,
      values,
      isSubmitted,
      callback,
      object
    }: IButtonMutateProps) => {
      const attachmentMoreArray: any[] = [];
      const attachment = values.attachment || undefined;
      const attachmentMore = values.attachmentMore || [];

      attachmentMore.map(att => {
        attachmentMoreArray.push({ ...att, __typename: undefined });
      });

      values.attachment = attachment
        ? { ...attachment, __typename: undefined }
        : null;
      values.attachmentMore = attachmentMoreArray;

      if (this.props.queryParams) {
        values.segmentIds = this.props.queryParams.segmentIds
          ? this.props.queryParams.segmentIds
            ? JSON.parse(this.props.queryParams.segmentIds)
            : []
          : [];
      }

      return (
        <ButtonMutate
          mutation={
            object && object._id
              ? mutations.assignmentCampaignsEdit
              : mutations.assignmentCampaignsAdd
          }
          variables={values}
          callback={callback}
          refetchQueries={getRefetchQueries()}
          isSubmitted={isSubmitted}
          type="submit"
          uppercase={false}
          successMessage={`You successfully ${
            object ? 'updated' : 'added'
          } a ${name}`}
        />
      );
    };

    const segments = segmentsQuery.segments || [];
    const voucherCampaigns = voucherCampaignsQuery.voucherCampaigns || [];
    const assignmentCampaign =
      assignmentCampaignDetailQuery.assignmentCampaignDetail || {};

    const updatedProps = {
      ...this.props,
      renderButton,
      segments,
      voucherCampaigns,
      assignmentCampaign
    };

    return <EditForm {...updatedProps} />;
  }
}

const getRefetchQueries = () => {
  return ['assignmentCampaigns'];
};

export default withProps<Props>(
  compose(
    graphql<Props, SegmentsQueryResponse>(gql(queries.segments), {
      name: 'segmentsQuery',
      options: ({ queryParams }) => ({
        variables: {
          ids:
            queryParams === undefined
              ? []
              : queryParams.segmentIds
              ? JSON.parse(queryParams.segmentIds)
              : [],
          contentTypes: ['contacts:customer']
        }
      })
    }),
    graphql<Props, VoucherCampaignQueryResponse>(
      gql(voucherCampaignQueries.voucherCampaigns),
      {
        name: 'voucherCampaignsQuery'
      }
    ),
    graphql<Props, AssignmentCampaignDetailQueryResponse>(
      gql(queries.assignmentCampaignDetail),
      {
        name: 'assignmentCampaignDetailQuery',
        options: ({ queryParams }) => ({
          variables: {
            _id: queryParams.campaignId
          }
        })
      }
    )
  )(AssignmentEditFormContainer)
);
