import * as compose from 'lodash.flowright';

import { Alert, router, withProps } from '@erxes/ui/src/utils';
import { Bulk, Spinner } from '@erxes/ui/src/components';
import {
  MainQueryResponse,
  RemoveMutationResponse,
  RemoveMutationVariables,
} from '../types';
import { mutations, queries } from '../graphql';

import List from '../components/List';
import { LotteryCampaignDetailQueryResponse } from '../../../configs/lotteryCampaign/types';
import React from 'react';
import { queries as campaignQueries } from '../../../configs/lotteryCampaign/graphql';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';

type Props = {
  queryParams: any;
};

type FinalProps = {
  lotteriesMainQuery: MainQueryResponse;
  lotteryCampaignDetailQuery: LotteryCampaignDetailQueryResponse;
} & Props  &
  RemoveMutationResponse;

type State = {
  loading: boolean;
};

class LotteryListContainer extends React.Component<FinalProps, State> {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
    };
  }

  render() {
    const {
      lotteriesMainQuery,
      lotteryCampaignDetailQuery,
      lotteriesRemove,
    } = this.props;

    if (
      lotteriesMainQuery.loading ||
      (lotteryCampaignDetailQuery && lotteryCampaignDetailQuery.loading)
    ) {
      return <Spinner />;
    }

    const removeLotteries = ({ lotteryIds }, emptyBulk) => {
      lotteriesRemove({
        variables: { _ids: lotteryIds },
      })
        .then(() => {
          emptyBulk();
          Alert.success('You successfully deleted a lottery');
        })
        .catch((e) => {
          Alert.error(e.message);
        });
    };

    const searchValue = this.props.queryParams.searchValue || '';
    const { list = [], totalCount = 0 } =
      lotteriesMainQuery.lotteriesMain || {};
    const currentCampaign =
      lotteryCampaignDetailQuery &&
      lotteryCampaignDetailQuery.lotteryCampaignDetail;

    const updatedProps = {
      ...this.props,
      totalCount,
      searchValue,
      lotteries: list,
      currentCampaign,
      removeLotteries,
    };

    const lotteriesList = (props) => {
      return <List {...updatedProps} {...props} />;
    };

    const refetch = () => {
      this.props.lotteriesMainQuery.refetch();
    };

    return <Bulk content={lotteriesList} refetch={refetch} />;
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
  voucherCampaignId: queryParams.voucherCampaignId,
});

const generateOptions = () => ({
  refetchQueries: [
    'lotteriesMain',
    'lotteryCounts',
    'lotteryCategories',
    'lotteryCategoriesTotalCount',
  ],
});

export default withProps<Props>(
  compose(
    graphql<{ queryParams: any }, MainQueryResponse>(
      gql(queries.lotteriesMain),
      {
        name: 'lotteriesMainQuery',
        options: ({ queryParams }) => ({
          variables: generateParams({ queryParams }),
          fetchPolicy: 'network-only',
        }),
      },
    ),
    graphql<Props, LotteryCampaignDetailQueryResponse>(
      gql(campaignQueries.lotteryCampaignDetail),
      {
        name: 'lotteryCampaignDetailQuery',
        options: ({ queryParams }) => ({
          variables: {
            _id: queryParams.campaignId,
          },
        }),
        skip: ({ queryParams }) => !queryParams.campaignId,
      },
    ),
    // mutations
    graphql<{}, RemoveMutationResponse, RemoveMutationVariables>(
      gql(mutations.lotteriesRemove),
      {
        name: 'lotteriesRemove',
        options: generateOptions,
      },
    ),
  )(LotteryListContainer),
);
