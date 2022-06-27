import { Bulk } from '@erxes/ui/src';
import { router } from '@erxes/ui/src/utils';
import { withProps } from '@erxes/ui/src/utils/core';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';
import LotteryDetail from '../../components/award/detail';
import { queries } from '../../graphql';

type Props = { queryParams: any };

type FinalProps = {
  lotteryCampaign: any;
  voucherDetail: any;
};
class AwardDetail extends React.Component<FinalProps, Props> {
  constructor(props) {
    super(props);
  }

  render() {
    const { voucherDetail, lotteryCampaign } = this.props;
    const updatedProps = {
      loading: voucherDetail.loading,
      data: voucherDetail.voucherCampaignDetails,
      lotteryCampaign: lotteryCampaign
    };

    const content = props => {
      return <LotteryDetail {...updatedProps} {...props} />;
    };

    return <Bulk content={content} />;
  }
}

const generateParams = ({ queryParams }) => ({
  ...router.generatePaginationParams(queryParams || {}),
  id: queryParams.ids,
  campaignId: queryParams.campaignId,
  awardId: queryParams.awardId,
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
    graphql<{ queryParams: [string] }>(gql(queries.lotteryDetails), {
      name: 'voucherDetail',
      options: ({ queryParams }) => ({
        variables: generateParams({ queryParams }),
        fetchPolicy: 'network-only'
      })
    })
  )(AwardDetail)
);
