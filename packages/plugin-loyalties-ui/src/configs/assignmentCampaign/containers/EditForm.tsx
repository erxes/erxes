import React from 'react';
import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { graphql } from '@apollo/client/react/hoc';
import { ButtonMutate, Spinner } from '@erxes/ui/src/components';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { mutations, queries } from '../graphql';
import { AssignmentCampaignDetailQueryResponse } from '../types';
import { withProps } from '@erxes/ui/src/utils';
import { VoucherCampaignQueryResponse } from '../../voucherCampaign/types';
import { queries as voucherCampaignQueries } from '../../voucherCampaign/graphql';
import EditForm from '../components/EditForm';

type Props = {
  history: any;
  queryParams: any;
};

type FinalProps = {
  assignmentCampaignDetailQuery: AssignmentCampaignDetailQueryResponse;
  voucherCampaignsQuery: VoucherCampaignQueryResponse;
} & Props;

class AssignmentEditFormContainer extends React.Component<FinalProps> {
  render() {
    const { voucherCampaignsQuery, assignmentCampaignDetailQuery } = this.props;

    if (
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

    const voucherCampaigns = voucherCampaignsQuery.voucherCampaigns || [];
    const assignmentCampaign =
      assignmentCampaignDetailQuery.assignmentCampaignDetail || {};

    const updatedProps = {
      ...this.props,
      renderButton,
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
