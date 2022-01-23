import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { Bulk, Alert, withProps, router, Spinner } from 'erxes-ui';
import React from 'react';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import { IRouterProps } from 'erxes-ui/lib/types';
import List from '../components/List';
import { mutations, queries } from '../graphql';
import { queries as compaignQueries } from '../../../configs/donateCompaign/graphql';
import { DonateCompaignDetailQueryResponse } from '../../../configs/donateCompaign/types';
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
  donatesMainQuery: MainQueryResponse;
  donateCompaignDetailQuery: DonateCompaignDetailQueryResponse;
} & Props &
  IRouterProps &
  RemoveMutationResponse;

type State = {
  loading: boolean;
};

class DonateListContainer extends React.Component<FinalProps, State> {
  constructor(props) {
    super(props);

    this.state = {
      loading: false
    };
  }

  render() {
    const {
      donatesMainQuery,
      donateCompaignDetailQuery,
      donatesRemove,
      history
    } = this.props;

    if (donatesMainQuery.loading || (donateCompaignDetailQuery && donateCompaignDetailQuery.loading)) {
      return <Spinner />;
    }

    const removeDonates = ({ donateIds }, emptyBulk) => {
      donatesRemove({
        variables: { _ids: donateIds }
      })
        .then(() => {
          emptyBulk();
          Alert.success('You successfully deleted a donate');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const searchValue = this.props.queryParams.searchValue || '';
    const { list = [], totalCount = 0 } = donatesMainQuery.donatesMain || {};
    const currentCompaign = donateCompaignDetailQuery && donateCompaignDetailQuery.donateCompaignDetail;

    const updatedProps = {
      ...this.props,
      totalCount,
      searchValue,
      donates: list,
      currentCompaign,
      removeDonates,
    };

    const donatesList = props => {
      return <List {...updatedProps} {...props} />;
    };

    const refetch = () => {
      this.props.donatesMainQuery.refetch();
    };

    return <Bulk content={donatesList} refetch={refetch} />;
  }
}

const generateParams = ({ queryParams }) => ({
  variables: {
    ...router.generatePaginationParams(queryParams || {}),
    ids: queryParams.ids,
    compaignId: queryParams.compaignId,
    status: queryParams.status,
    ownerId: queryParams.ownerId,
    ownerType: queryParams.ownerType,
    searchValue: queryParams.searchValue,
    sortField: queryParams.sortField,
    sortDirection: queryParams.sortDirection
      ? parseInt(queryParams.sortDirection, 1)
      : undefined
  },
  fetchPolicy: 'network-only'
});

const generateOptions = () => ({
  refetchQueries: ['donatesMain', 'donateCounts', 'donateCategories', 'donateCategoriesTotalCount']
});

export default withProps<Props>(
  compose(
    graphql<{ queryParams: any }, MainQueryResponse>(
      gql(queries.donatesMain),
      {
        name: 'donatesMainQuery',
        options: generateParams
      }
    ),
    graphql<Props, DonateCompaignDetailQueryResponse>(
      gql(compaignQueries.donateCompaignDetail),
      {
        name: 'donateCompaignDetailQuery',
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
      gql(mutations.donatesRemove),
      {
        name: 'donatesRemove',
        options: generateOptions
      }
    ),
  )(withRouter<IRouterProps>(DonateListContainer))
);
