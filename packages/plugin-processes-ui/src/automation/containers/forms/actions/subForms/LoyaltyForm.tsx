import { queries as voucherCampaignQueries } from '@erxes/plugin-loyalties-ui/src/configs/voucherCampaign/graphql';
import { VoucherCampaignQueryResponse } from '@erxes/plugin-loyalties-ui/src/configs/voucherCampaign/types';
import { withProps } from '@erxes/ui/src/utils';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';
import Form from '../../../../components/forms/actions/subForms/LoyaltyForm';

type Props = {
  contentType: string;
  activeAction: any;
  addAction: (action: any, id?: string, config?: any) => void;
  closeModal: () => void;
  triggerType: string;
  common: any;
};

type FinalProps = {
  voucherCampaignQuery: VoucherCampaignQueryResponse;
} & Props;

class LoyaltyFormContainer extends React.Component<FinalProps> {
  render() {
    const { voucherCampaignQuery } = this.props;

    if (voucherCampaignQuery.loading) {
      return null;
    }

    const voucherCampaigns = voucherCampaignQuery.voucherCampaigns || [];

    const updatedProps = {
      ...this.props,
      voucherCampaigns
    };

    return <Form {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, VoucherCampaignQueryResponse>(
      gql(voucherCampaignQueries.voucherCampaigns),
      {
        name: 'voucherCampaignQuery'
      }
    )
  )(LoyaltyFormContainer)
);
