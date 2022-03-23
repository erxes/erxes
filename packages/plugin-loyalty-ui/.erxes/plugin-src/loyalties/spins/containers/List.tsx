import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { Alert, withProps, router } from '@erxes/ui/src/utils';
import { Bulk, Spinner } from '@erxes/ui/src/components';
import React from 'react';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import { IRouterProps } from '@erxes/ui/src/types';
import List from '../components/List';
import { mutations, queries } from '../graphql';
import { queries as compaignQueries } from '../../../configs/spinCompaign/graphql';
import { SpinCompaignDetailQueryResponse } from '../../../configs/spinCompaign/types';
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
  spinsMainQuery: MainQueryResponse;
  spinCompaignDetailQuery: SpinCompaignDetailQueryResponse;
} & Props &
  IRouterProps &
  RemoveMutationResponse;

type State = {
  loading: boolean;
};

class SpinListContainer extends React.Component<FinalProps, State> {
  constructor(props) {
    super(props);

    this.state = {
      loading: false
    };
  }

  render() {
    const {
      spinsMainQuery,
      spinCompaignDetailQuery,
      spinsRemove,
      history
    } = this.props;

    if (spinsMainQuery.loading || (spinCompaignDetailQuery && spinCompaignDetailQuery.loading)) {
      return <Spinner />;
    }

    const removeSpins = ({ spinIds }, emptyBulk) => {
      spinsRemove({
        variables: { _ids: spinIds }
      })
        .then(() => {
          emptyBulk();
          Alert.success('You successfully deleted a spin');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const searchValue = this.props.queryParams.searchValue || '';
    const { list = [], totalCount = 0 } = spinsMainQuery.spinsMain || {};
    const currentCompaign = spinCompaignDetailQuery && spinCompaignDetailQuery.spinCompaignDetail;

    const updatedProps = {
      ...this.props,
      totalCount,
      searchValue,
      spins: list,
      currentCompaign,
      removeSpins,
    };

    const spinsList = props => {
      return <List {...updatedProps} {...props} />;
    };

    const refetch = () => {
      this.props.spinsMainQuery.refetch();
    };

    return <Bulk content={spinsList} refetch={refetch} />;
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
  refetchQueries: ['spinsMain', 'spinCounts', 'spinCategories', 'spinCategoriesTotalCount']
});

export default withProps<Props>(
  compose(
    graphql<{ queryParams: any }, MainQueryResponse>(
      gql(queries.spinsMain),
      {
        name: 'spinsMainQuery',
        options: ({ queryParams }) => ({
          variables: generateParams({ queryParams }),
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<Props, SpinCompaignDetailQueryResponse>(
      gql(compaignQueries.spinCompaignDetail),
      {
        name: 'spinCompaignDetailQuery',
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
      gql(mutations.spinsRemove),
      {
        name: 'spinsRemove',
        options: generateOptions
      }
    ),
  )(withRouter<IRouterProps>(SpinListContainer))
);
