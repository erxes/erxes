import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import { ButtonMutate } from '@erxes/ui/src/components';
import { withProps } from '@erxes/ui/src/utils';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import From from '../components/Form';
import { mutations } from '../graphql';
import { queries as voucherCampaignQueries } from '../../voucherCampaign/graphql';
import { IDonateCampaign } from '../types';
import { VoucherCampaignQueryResponse } from '../../voucherCampaign/types';

type Props = {
  donateCampaign?: IDonateCampaign;
  closeModal: () => void;
};

type FinalProps = {
  voucherCampaignsQuery: VoucherCampaignQueryResponse;
} & Props;

class ProductFormContainer extends React.Component<FinalProps> {
  render() {
    const { voucherCampaignsQuery } = this.props;

    if (voucherCampaignsQuery.loading) {
      return null;
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
              ? mutations.donateCampaignsEdit
              : mutations.donateCampaignsAdd
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

    return <From {...updatedProps} />;
  }
}

const getRefetchQueries = () => {
  return ['donateCampaigns'];
};

export default withProps<Props>(
  compose(
    graphql<Props, VoucherCampaignQueryResponse>(
      gql(voucherCampaignQueries.voucherCampaigns),
      {
        name: 'voucherCampaignsQuery'
      }
    )
  )(ProductFormContainer)
);
