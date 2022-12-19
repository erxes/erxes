import React from 'react';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { graphql } from 'react-apollo';
import { ButtonMutate, Spinner } from '@erxes/ui/src/components';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import Form from '../components/Form';
import { mutations, queries } from '../graphql';
import {
  AssignmentCampaignQueryResponse,
  IAssignmentCampaign,
  SegmentsDetailQueryResponse
} from '../types';
import { withProps } from '@erxes/ui/src/utils';
import { VoucherCampaignQueryResponse } from '../../voucherCampaign/types';
import { queries as voucherCampaignQueries } from '../../voucherCampaign/graphql';

type Props = {
  history: any;
  queryParams: any;
};

type FinalProps = {
  assignmentCampaignsQuery: AssignmentCampaignQueryResponse;
  segmentsDetailQuery: SegmentsDetailQueryResponse;
  voucherCampaignsQuery: VoucherCampaignQueryResponse;
} & Props;

class AssignmentCreateFormContainer extends React.Component<FinalProps> {
  render() {
    const { segmentsDetailQuery, voucherCampaignsQuery, history } = this.props;
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

    const segmentDetails = segmentsDetailQuery.segmentsDetail || [];
    const voucherCampaigns = voucherCampaignsQuery.voucherCampaigns || [];

    const updatedProps = {
      ...this.props,
      renderButton,
      segmentDetails,
      voucherCampaigns
    };

    return <Form {...updatedProps} />;
  }
}

const getRefetchQueries = () => {
  return ['assignmentCampaigns'];
};

export default withProps<Props>(
  compose(
    graphql<Props, SegmentsDetailQueryResponse>(gql(queries.segmentsDetail), {
      name: 'segmentsDetailQuery',
      options: ({ queryParams }) => ({
        variables: {
          _ids:
            queryParams === undefined
              ? []
              : queryParams.segmentIds
              ? JSON.parse(queryParams.segmentIds)
              : []
        }
      })
    }),
    graphql<Props, VoucherCampaignQueryResponse>(
      gql(voucherCampaignQueries.voucherCampaigns),
      {
        name: 'voucherCampaignsQuery'
      }
    )
  )(AssignmentCreateFormContainer)
);
