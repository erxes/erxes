import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { Bulk, Alert, withProps, router } from '@erxes/ui/src';
import React from 'react';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import { IRouterProps } from '@erxes/ui/src/types';
import CarsList from '../components/list/CarsList';
import { mutations, queries } from '../graphql';
import {
  ListQueryVariables,
  MainQueryResponse,
  MergeMutationResponse,
  MergeMutationVariables,
  RemoveMutationResponse,
  RemoveMutationVariables
} from '../types';

type Props = {
  queryParams: any;
  history: any;
};

type FinalProps = {
  carsMainQuery: MainQueryResponse;
} & Props &
  IRouterProps &
  RemoveMutationResponse &
  MergeMutationResponse;

type State = {
  loading: boolean;
};

class CarListContainer extends React.Component<FinalProps, State> {
  constructor(props) {
    super(props);

    this.state = {
      loading: false
    };
  }

  render() {
    const { carsMainQuery, carsRemove, carsMerge, history } = this.props;

    const removeCars = ({ carIds }, emptyBulk) => {
      carsRemove({
        variables: { carIds }
      })
        .then(() => {
          emptyBulk();
          Alert.success('You successfully deleted a car');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const mergeCars = ({ ids, data, callback }) => {
      carsMerge({
        variables: {
          carIds: ids,
          carFields: data
        }
      })
        .then(response => {
          Alert.success('You successfully merged cars');
          callback();
          history.push(
            `/erxes-plugin-car/details/${response.data.carsMerge._id}`
          );
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const searchValue = this.props.queryParams.searchValue || '';
    const { list = [], totalCount = 0 } = carsMainQuery.carsMain || {};

    const updatedProps = {
      ...this.props,
      totalCount,
      searchValue,
      cars: list,
      loading: carsMainQuery.loading || this.state.loading,
      removeCars,
      mergeCars
    };

    const carsList = props => {
      return <CarsList {...updatedProps} {...props} />;
    };

    const refetch = () => {
      this.props.carsMainQuery.refetch();
    };

    return <Bulk content={carsList} refetch={refetch} />;
  }
}

const generateParams = ({ queryParams }) => ({
  variables: {
    ...router.generatePaginationParams(queryParams || {}),
    ids: queryParams.ids,
    categoryId: queryParams.categoryId,
    searchValue: queryParams.searchValue,
    sortField: queryParams.sortField,
    sortDirection: queryParams.sortDirection
      ? parseInt(queryParams.sortDirection, 10)
      : undefined
  },
  fetchPolicy: 'network-only'
});

const generateOptions = () => ({
  refetchQueries: [
    'carsMain',
    'carCounts',
    'carCategories',
    'carCategoriesTotalCount'
  ]
});

export default withProps<Props>(
  compose(
    graphql<{ queryParams: any }, MainQueryResponse, ListQueryVariables>(
      gql(queries.carsMain),
      {
        name: 'carsMainQuery',
        options: generateParams
      }
    ),
    // mutations
    graphql<{}, RemoveMutationResponse, RemoveMutationVariables>(
      gql(mutations.carsRemove),
      {
        name: 'carsRemove',
        options: generateOptions
      }
    ),
    graphql<{}, MergeMutationResponse, MergeMutationVariables>(
      gql(mutations.carsMerge),
      {
        name: 'carsMerge',
        options: generateOptions
      }
    )
  )(withRouter<IRouterProps>(CarListContainer))
);
