import { withProps } from '@erxes/ui/src/utils';
import { Spinner } from '@erxes/ui/src/components';
import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';

import List from '../components/CampaignList';
import { queries } from '../../../configs/voucherCampaign/graphql';
import {
  VoucherCampaignsCountQueryResponse,
  VoucherCampaignQueryResponse
} from '../../../configs/voucherCampaign/types';

type Props = { history: any; queryParams: any };

type FinalProps = {
  voucherCampaignQuery: VoucherCampaignQueryResponse;
  voucherCampaignsCountQuery: VoucherCampaignsCountQueryResponse;
} & Props;

class CarListContainer extends React.Component<FinalProps> {
  render() {
    const { voucherCampaignQuery, voucherCampaignsCountQuery } = this.props;

    if (voucherCampaignQuery.loading || voucherCampaignsCountQuery.loading) {
      return <Spinner />;
    }
    const voucherCampaigns = voucherCampaignQuery.voucherCampaigns || [];

    const updatedProps = {
      ...this.props,
      refetch: voucherCampaignQuery.refetch,
      voucherCampaigns,
      loading: voucherCampaignQuery.loading,
      voucherCampaignsCount:
        voucherCampaignsCountQuery.voucherCampaignsCount || 0
    };

    return <List {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, VoucherCampaignQueryResponse, { parentId: string }>(
      gql(queries.voucherCampaigns),
      {
        name: 'voucherCampaignQuery',
        options: {
          fetchPolicy: 'network-only'
        }
      }
    ),
    graphql<Props, VoucherCampaignsCountQueryResponse>(
      gql(queries.voucherCampaignsCount),
      {
        name: 'voucherCampaignsCountQuery'
      }
    )
  )(CarListContainer)
);
