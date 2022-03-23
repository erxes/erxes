import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { Bulk, Spinner } from '@erxes/ui/src/components';
import { Alert, withProps, router } from '@erxes/ui/src/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import { IRouterProps } from '@erxes/ui/src/types';
import List from '../components/List';
import { mutations, queries } from '../graphql';
import { queries as compaignQueries } from '../../../configs/lotteryCompaign/graphql';
import { LotteryCompaignDetailQueryResponse } from '../../../configs/lotteryCompaign/types';
import {
  MainQueryResponse,
  RemoveMutationResponse,
  RemoveMutationVariables
} from '../types';

type Props = {
  queryParams: any;
  history: any;
};

type FinalProps = {
  lotteriesMainQuery: MainQueryResponse;
  lotteryCompaignDetailQuery: LotteryCompaignDetailQueryResponse;
} & Props &
  IRouterProps &
  RemoveMutationResponse;

type State = {
  loading: boolean;
};

class LotteryListContainer extends React.Component<FinalProps, State> {
  constructor(props) {
    super(props);

    this.state = {
      loading: false
    };
  }

  render() {
    const {
      lotteriesMainQuery,
      lotteryCompaignDetailQuery,
      lotteriesRemove,
      history
    } = this.props;

    if (lotteriesMainQuery.loading || (lotteryCompaignDetailQuery && lotteryCompaignDetailQuery.loading)) {
      return <Spinner />;
    }

    const removeLotteries = ({ lotteryIds }, emptyBulk) => {
      lotteriesRemove({
        variables: { _ids: lotteryIds }
      })
        .then(() => {
          emptyBulk();
          Alert.success('You successfully deleted a lottery');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const searchValue = this.props.queryParams.searchValue || '';
    const { list = [], totalCount = 0 } = lotteriesMainQuery.lotteriesMain || {};
    const currentCompaign = lotteryCompaignDetailQuery && lotteryCompaignDetailQuery.lotteryCompaignDetail;

    const updatedProps = {
      ...this.props,
      totalCount,
      searchValue,
      lotteries: list,
      currentCompaign,
      removeLotteries,
    };

    const lotteriesList = props => {
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
  compaignId: queryParams.compaignId,
  status: queryParams.status,
  ownerId: queryParams.ownerId,
  ownerType: queryParams.ownerType,
  searchValue: queryParams.searchValue,
  sortField: queryParams.sortField,
  sortDirection: parseInt(queryParams.sortDirection) || undefined,
  voucherCompaignId: queryParams.voucherCompaignId,
});

const generateOptions = () => ({
  refetchQueries: ['lotteriesMain', 'lotteryCounts', 'lotteryCategories', 'lotteryCategoriesTotalCount']
});

export default withProps<Props>(
  compose(
    graphql<{ queryParams: any }, MainQueryResponse>(
      gql(queries.lotteriesMain),
      {
        name: 'lotteriesMainQuery',
        options: ({ queryParams }) => ({
          variables: generateParams({ queryParams }),
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<Props, LotteryCompaignDetailQueryResponse>(
      gql(compaignQueries.lotteryCompaignDetail),
      {
        name: 'lotteryCompaignDetailQuery',
        options: ({ queryParams }) => ({
          variables: {
            _id: queryParams.compaignId
          }
        }),
        skip: ({ queryParams }) => !queryParams.compaignId,
      }
    ),
    // mutations
    graphql<{}, RemoveMutationResponse, RemoveMutationVariables>(
      gql(mutations.lotteriesRemove),
      {
        name: 'lotteriesRemove',
        options: generateOptions
      }
    ),
  )(withRouter<IRouterProps>(LotteryListContainer))
);
