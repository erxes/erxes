import * as compose from 'lodash.flowright';

import { Bulk, Spinner } from '@erxes/ui/src/components';
import { router, withProps } from '@erxes/ui/src/utils';

import { IRouterProps } from '@erxes/ui/src/types';
import { LotteryCampaignDetailQueryResponse } from '../../../configs/lotteryCampaign/types';
import React from 'react';
import { RemoveMutationResponse } from '../types';
import VoucherAward from '../components/Award';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { queries } from '../../../configs/lotteryCampaign/graphql';
import { withRouter } from 'react-router-dom';

type Props = { history: any; queryParams: any; voucherCampaignId: string };
type FinalProps = {
  doLottery: any;
  lotteryCampaignDetailQuery: LotteryCampaignDetailQueryResponse;
  multipledoLottery: any;
} & Props &
  IRouterProps &
  RemoveMutationResponse;

type State = {
  loading: boolean;
};
class AwardContainer extends React.Component<FinalProps, State> {
  constructor(props) {
    super(props);

    this.state = {
      loading: false
    };
    this.doLotteries = this.doLotteries.bind(this);
  }
  doLotteries(variables: any) {
    this.props.doLottery({ variables }).then(() => {});
  }

  render() {
    if (this.props.lotteryCampaignDetailQuery.loading) {
      return <Spinner />;
    }

    const updatedProps = {
      ...this.props,
      lotteryCampaign: this.props.lotteryCampaignDetailQuery
        .lotteryCampaignDetail,
      doLotteries: this.doLotteries
    };

    const refetch = () => {
      this.props.lotteryCampaignDetailQuery.refetch();
    };

    const list = props => {
      return <VoucherAward {...updatedProps} {...props} />;
    };

    return <Bulk content={list} refetch={refetch} />;
  }
}

const generateParams = ({ queryParams }) => ({
  ...router.generatePaginationParams(queryParams || {}),
  ids: queryParams.ids,
  campaignId: queryParams.campaignId,
  status: queryParams.status,
  ownerId: queryParams.ownerId,
  ownerType: queryParams.ownerType,
  searchValue: queryParams.searchValue,
  sortField: queryParams.sortField,
  sortDirection: Number(queryParams.sortDirection) || undefined,
  voucherCampaignId: queryParams.voucherCampaignId
});

export default withProps<Props>(
  compose(
    graphql<Props, LotteryCampaignDetailQueryResponse>(
      gql(queries.lotteryCampaignDetail),
      {
        name: 'lotteryCampaignDetailQuery',
        options: ({ queryParams }) => ({
          variables: {
            _id: queryParams.campaignId
          }
        }),
        skip: ({ queryParams }) => !queryParams.campaignId
      }
    )
  )(withRouter<IRouterProps>(AwardContainer))
);
