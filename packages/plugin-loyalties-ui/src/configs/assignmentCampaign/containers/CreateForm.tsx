import React from 'react';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { graphql } from 'react-apollo';
import { ButtonMutate, Spinner } from '@erxes/ui/src/components';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { mutations, queries } from '../graphql';
import {
  AssignmentCampaignQueryResponse,
  SegmentsQueryResponse
} from '../types';
import { withProps } from '@erxes/ui/src/utils';
import { VoucherCampaignQueryResponse } from '../../voucherCampaign/types';
import { queries as voucherCampaignQueries } from '../../voucherCampaign/graphql';
import CreateForm from '../components/CreateForm';

type Props = {
  history: any;
  queryParams: any;
};

type FinalProps = {
  assignmentCampaignsQuery: AssignmentCampaignQueryResponse;
  segmentsQuery: SegmentsQueryResponse;
  voucherCampaignsQuery: VoucherCampaignQueryResponse;
} & Props;

class AssignmentCreateFormContainer extends React.Component<FinalProps> {
  render() {
    const { segmentsQuery, voucherCampaignsQuery } = this.props;

    if (segmentsQuery.loading || voucherCampaignsQuery.loading) {
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

    const updatedProps = {
      ...this.props,
      renderButton,
      segments,
      voucherCampaigns
    };

    return <CreateForm {...updatedProps} />;
  }
}

const getRefetchQueries = () => {
  return ['assignmentCampaigns'];
};

export default withProps<Props>(
  compose(
    graphql<Props, SegmentsQueryResponse>(gql(queries.segments), {
      name: 'segmentsQuery',
      options: () => ({
        variables: {
          contentTypes: ['contacts:customer', 'contacts:lead']
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
