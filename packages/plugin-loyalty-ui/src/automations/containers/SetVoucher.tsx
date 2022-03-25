import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';

import { withProps } from '@erxes/ui/src';
import Form from '../components/SetVoucher';
import { queries as voucherCampaignQueries } from '../../configs/voucherCampaign/graphql';

import { VoucherCampaignQueryResponse } from '../../configs/voucherCampaign/types';


type Props = {
  contentType: string;
  activeAction: any;
  addAction: (action: any, id?: string, config?: any) => void;
  closeModal: () => void;
  triggerType: string;
  common: any
};

type FinalProps = {
  voucherCampaignQuery: VoucherCampaignQueryResponse;
} & Props;

class ProductFormContainer extends React.Component<FinalProps> {
  render() {
    const { voucherCampaignQuery } = this.props;

    if (voucherCampaignQuery.loading) {
      return null;
    }

    const voucherCampaigns = voucherCampaignQuery.voucherCampaigns || [];

    const updatedProps = {
      ...this.props,
      voucherCampaigns,
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
    ),
  )(ProductFormContainer)
);
