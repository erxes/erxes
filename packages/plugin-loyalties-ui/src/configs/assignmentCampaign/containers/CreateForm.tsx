import React from 'react';
import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { graphql } from '@apollo/client/react/hoc';
import { ButtonMutate, Spinner } from '@erxes/ui/src/components';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { mutations } from '../graphql';
import { AssignmentCampaignQueryResponse } from '../types';
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
  voucherCampaignsQuery: VoucherCampaignQueryResponse;
} & Props;

class AssignmentCreateFormContainer extends React.Component<FinalProps> {
  render() {
    const { voucherCampaignsQuery } = this.props;

    if (voucherCampaignsQuery.loading) {
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

    const updatedProps = {
      ...this.props,
      renderButton,
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
    graphql<Props, VoucherCampaignQueryResponse>(
      gql(voucherCampaignQueries.voucherCampaigns),
      {
        name: 'voucherCampaignsQuery'
      }
    )
  )(AssignmentCreateFormContainer)
);
