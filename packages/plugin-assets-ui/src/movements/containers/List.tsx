import { Alert, Bulk, confirm, Spinner } from '@erxes/ui/src';
import { IRouterProps } from '@erxes/ui/src/types';
import { withProps } from '@erxes/ui/src/utils/core';
import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import {
  MovementQueryResponse,
  MovementsTotalCountQueryResponse
} from '../../common/types';
import { generateParams, movementRefetchQueries } from '../../common/utils';
import List from '../components/List';
import { mutations, queries } from '../graphql';

type Props = { queryParams: any; history: string };
type FinalProps = {
  movementsQuery: MovementQueryResponse;
  movementsTotalCountQuery: MovementsTotalCountQueryResponse;
  movementRemove: any;
} & IRouterProps &
  Props;

class ListContainer extends React.Component<FinalProps> {
  constructor(props) {
    super(props);

    this.renderList = this.renderList.bind(this);
  }

  renderList() {
    const { movementsQuery, movementsTotalCountQuery, history } = this.props;

    if (movementsQuery.loading) {
      return <Spinner />;
    }

    const remove = (ids: string[]) => {
      confirm()
        .then(() => {
          this.props.movementRemove({ variables: { ids } }).then(() => {
            Alert.success('Removed movement');
          });
        })
        .catch(error => Alert.error(error.message));
    };

    const updateProps = {
      ...this.props,
      movements: movementsQuery.assetMovements,
      totalCount: movementsTotalCountQuery.assetMovementTotalCount,
      loading: movementsQuery.loading,
      history,
      remove
    };

    return <List {...updateProps} />;
  }

  render() {
    const refetch = () => {
      this.props.movementsQuery.refetch();
      this.props.movementsTotalCountQuery.refetch();
    };

    return <Bulk content={this.renderList} refetch={refetch} />;
  }
}

export default withProps(
  compose(
    graphql<Props>(gql(queries.movements), {
      name: 'movementsQuery',
      options: ({ queryParams }) => ({
        variables: generateParams({ queryParams })
      })
    }),
    graphql<Props>(gql(queries.movementsTotalCount), {
      name: 'movementsTotalCountQuery',
      options: ({ queryParams }) => ({
        variables: generateParams({ queryParams })
      })
    }),
    graphql<Props>(gql(mutations.movementRemove), {
      name: 'movementRemove',
      options: ({ queryParams }) => ({
        refetchQueries: movementRefetchQueries(queryParams)
      })
    })
  )(ListContainer)
);
