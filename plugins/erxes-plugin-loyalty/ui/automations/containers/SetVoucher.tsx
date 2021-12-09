import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';

import { withProps} from 'erxes-ui';
import Form from '../components/SetVoucher';
import { queries as voucherCompaignQueries } from '../../configs/voucherCompaign/graphql';

import { VoucherCompaignQueryResponse } from '../../configs/voucherCompaign/types';


type Props = {
  contentType: string;
  activeAction: any;
  addAction: (action: any, id?: string, config?: any) => void;
  closeModal: () => void;
  triggerType: string;
  common: any
};

type FinalProps = {
  voucherCompaignQuery: VoucherCompaignQueryResponse;
} & Props;

class ProductFormContainer extends React.Component<FinalProps> {
  render() {
    const { voucherCompaignQuery } = this.props;

    if (voucherCompaignQuery.loading) {
      return null;
    }

    const voucherCompaigns = voucherCompaignQuery.voucherCompaigns || [];

    const updatedProps = {
      ...this.props,
      voucherCompaigns,
    };

    return <Form {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, VoucherCompaignQueryResponse>(
      gql(voucherCompaignQueries.voucherCompaigns),
      {
        name: 'voucherCompaignQuery'
      }
    ),
  )(ProductFormContainer)
);
