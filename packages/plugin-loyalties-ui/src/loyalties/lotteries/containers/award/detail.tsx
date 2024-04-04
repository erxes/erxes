import { Bulk } from '@erxes/ui/src';
import { router } from '@erxes/ui/src/utils';
import { withProps } from '@erxes/ui/src/utils/core';
import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import LotteryDetail from '../../components/award/detail';
import { queries } from '../../../../configs/voucherCampaign/graphql';

type Props = { queryParams: any };

type FinalProps = {
  lotteryCampaign: any;
  voucherCampaigns: any;
};
class AwardDetail extends React.Component<FinalProps, Props> {
  constructor(props) {
    super(props);
  }

  render() {
    const { voucherCampaigns, lotteryCampaign } = this.props;
    const updatedProps = {
      loading: voucherCampaigns.loading,
      data: voucherCampaigns.voucherCampaigns,
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
  _ids: queryParams.ids,
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
    graphql<{ queryParams: [string] }>(gql(queries.voucherCampaigns), {
      name: 'voucherCampaigns',
      options: ({ queryParams }) => ({
        variables: generateParams({ queryParams }),
        fetchPolicy: 'network-only'
      })
    })
  )(AwardDetail)
);
