import * as compose from 'lodash.flowright';

import { Alert, router, withProps } from '@erxes/ui/src/utils';
import { Bulk, Spinner } from '@erxes/ui/src/components';
import {
  MainQueryResponse,
  RemoveMutationResponse,
  RemoveMutationVariables,
} from '../types';
import { mutations, queries } from '../graphql';

import { DonateCampaignDetailQueryResponse } from '../../../configs/donateCampaign/types';
import List from '../components/List';
import React from 'react';
import { queries as campaignQueries } from '../../../configs/donateCampaign/graphql';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';

type Props = {
  queryParams: any;
};

type FinalProps = {
  donatesMainQuery: MainQueryResponse;
  donateCampaignDetailQuery: DonateCampaignDetailQueryResponse;
} & Props  &
  RemoveMutationResponse;

type State = {
  loading: boolean;
};

class DonateListContainer extends React.Component<FinalProps, State> {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
    };
  }

  render() {
    const {
      donatesMainQuery,
      donateCampaignDetailQuery,
      donatesRemove,
    } = this.props;

    if (
      donatesMainQuery.loading ||
      (donateCampaignDetailQuery && donateCampaignDetailQuery.loading)
    ) {
      return <Spinner />;
    }

    const removeDonates = ({ donateIds }, emptyBulk) => {
      donatesRemove({
        variables: { _ids: donateIds },
      })
        .then(() => {
          emptyBulk();
          Alert.success('You successfully deleted a donate');
        })
        .catch((e) => {
          Alert.error(e.message);
        });
    };

    const searchValue = this.props.queryParams.searchValue || '';
    const { list = [], totalCount = 0 } = donatesMainQuery.donatesMain || {};
    const currentCampaign =
      donateCampaignDetailQuery &&
      donateCampaignDetailQuery.donateCampaignDetail;

    const updatedProps = {
      ...this.props,
      totalCount,
      searchValue,
      donates: list,
      currentCampaign,
      removeDonates,
    };

    const donatesList = (props) => {
      return <List {...updatedProps} {...props} />;
    };

    const refetch = () => {
      this.props.donatesMainQuery.refetch();
    };

    return <Bulk content={donatesList} refetch={refetch} />;
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
});

const generateOptions = () => ({
  refetchQueries: [
    'donatesMain',
    'donateCounts',
    'donateCategories',
    'donateCategoriesTotalCount',
  ],
});

export default withProps<Props>(
  compose(
    graphql<{ queryParams: any }, MainQueryResponse>(gql(queries.donatesMain), {
      name: 'donatesMainQuery',
      options: ({ queryParams }) => ({
        variables: generateParams({ queryParams }),
        fetchPolicy: 'network-only',
      }),
    }),
    graphql<Props, DonateCampaignDetailQueryResponse>(
      gql(campaignQueries.donateCampaignDetail),
      {
        name: 'donateCampaignDetailQuery',
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
      gql(mutations.donatesRemove),
      {
        name: 'donatesRemove',
        options: generateOptions,
      },
    ),
  )(DonateListContainer),
);
