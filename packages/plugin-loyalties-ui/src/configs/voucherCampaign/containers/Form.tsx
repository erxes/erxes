import * as compose from 'lodash.flowright';
import From from '../components/Form';
import { gql } from '@apollo/client';
import React from 'react';
import { ButtonMutate } from '@erxes/ui/src/components';
import { graphql } from '@apollo/client/react/hoc';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { IVoucherCampaign } from '../types';
import { LotteryCampaignQueryResponse } from '../../lotteryCampaign/types';
import { mutations } from '../graphql';
import { queries as spinCampaignQueries } from '../../spinCampaign/graphql';
import { queries as lotteryCampaignQueries } from '../../lotteryCampaign/graphql';
import { SpinCampaignQueryResponse } from '../../spinCampaign/types';
import { withProps } from '@erxes/ui/src/utils';

type Props = {
  voucherCampaign?: IVoucherCampaign;
  closeModal: () => void;
};

type FinalProps = {
  spinCampaignQuery: SpinCampaignQueryResponse;
  lotteryCampaignQuery: LotteryCampaignQueryResponse;
} & Props;

class ProductFormContainer extends React.Component<FinalProps> {
  render() {
    const { spinCampaignQuery, lotteryCampaignQuery } = this.props;

    if (spinCampaignQuery.loading || lotteryCampaignQuery.loading) {
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
              ? mutations.voucherCampaignsEdit
              : mutations.voucherCampaignsAdd
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

    const spinCampaigns = spinCampaignQuery.spinCampaigns || [];
    const lotteryCampaigns = lotteryCampaignQuery.lotteryCampaigns || [];

    const updatedProps = {
      ...this.props,
      renderButton,
      spinCampaigns,
      lotteryCampaigns
    };

    return <From {...updatedProps} />;
  }
}

const getRefetchQueries = () => {
  return ['voucherCampaigns'];
};

export default withProps<Props>(
  compose(
    graphql<Props, SpinCampaignQueryResponse>(
      gql(spinCampaignQueries.spinCampaigns),
      {
        name: 'spinCampaignQuery'
      }
    ),
    graphql<Props, LotteryCampaignQueryResponse>(
      gql(lotteryCampaignQueries.lotteryCampaigns),
      {
        name: 'lotteryCampaignQuery'
      }
    )
  )(ProductFormContainer)
);
