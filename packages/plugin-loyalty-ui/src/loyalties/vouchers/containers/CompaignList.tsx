import { withProps } from '@erxes/ui/src/utils';
import { Spinner } from '@erxes/ui/src/components';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';

import List from '../components/CompaignList';
import { queries } from '../../../configs/voucherCompaign/graphql';
import {
  VoucherCompaignsCountQueryResponse,
  VoucherCompaignQueryResponse
} from '../../../configs/voucherCompaign/types';

type Props = { history: any; queryParams: any };

type FinalProps = {
  voucherCompaignQuery: VoucherCompaignQueryResponse;
  voucherCompaignsCountQuery: VoucherCompaignsCountQueryResponse;
} & Props;

class CarListContainer extends React.Component<FinalProps> {
  render() {
    const {
      voucherCompaignQuery,
      voucherCompaignsCountQuery,
    } = this.props;

    if (voucherCompaignQuery.loading || voucherCompaignsCountQuery.loading) {
      return <Spinner />
    }
    const voucherCompaigns = voucherCompaignQuery.voucherCompaigns || [];

    const updatedProps = {
      ...this.props,
      refetch: voucherCompaignQuery.refetch,
      voucherCompaigns,
      loading: voucherCompaignQuery.loading,
      voucherCompaignsCount:
        voucherCompaignsCountQuery.voucherCompaignsCount || 0
    };

    return <List {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, VoucherCompaignQueryResponse, { parentId: string }>(
      gql(queries.voucherCompaigns),
      {
        name: 'voucherCompaignQuery',
        options: {
          fetchPolicy: 'network-only'
        }
      }
    ),
    graphql<Props, VoucherCompaignsCountQueryResponse>(
      gql(queries.voucherCompaignsCount),
      {
        name: 'voucherCompaignsCountQuery'
      }
    ),
  )(CarListContainer)
);
