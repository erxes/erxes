import { ICommonFormProps } from '@erxes/ui-settings/src/common/types';
import { EmptyState } from '@erxes/ui/src';
import { IRouterProps } from '@erxes/ui/src/types';
import { Alert, confirm } from '@erxes/ui/src/utils';
import { withProps } from '@erxes/ui/src/utils/core';
import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import { ICommonListProps } from '../../common/types';
import {
  RiskIndicatorsListQueryResponse,
  RiskIndicatorsTotalCountQueryResponse
} from '../common/types';
import { generateParams } from '../common/utils';
import List from '../components/List';
import { mutations, queries } from '../graphql';

type Props = {
  queryParams: any;
  history: any;
};

type FinalProps = {
  listQuery: RiskIndicatorsListQueryResponse;
  totalCountQuery: RiskIndicatorsTotalCountQueryResponse;
  removeMutation: any;
} & Props &
  ICommonListProps &
  IRouterProps &
  ICommonFormProps;
class ListContainer extends React.Component<FinalProps> {
  render() {
    const { removeMutation, listQuery, totalCountQuery, history } = this.props;

    const { riskIndicators, loading, error } = listQuery;

    if (error) {
      return <EmptyState icon="info-circle" text={error} />;
    }

    const remove = (_ids: string[]) => {
      confirm('Are you sure?').then(() => {
        removeMutation({ variables: { _ids } })
          .then(() => {
            listQuery.refetch();
            Alert.success('You successfully removed risk assesments');
          })
          .catch(e => {
            Alert.error(e.message);
          });
      });
    };

    const updatedProps = {
      ...this.props,
      list: riskIndicators,
      totalCount: totalCountQuery?.riskIndicatorsTotalCount || 0,
      refetch: listQuery.refetch,
      loading,
      remove,
      history
    };

    return <List {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.list), {
      name: 'listQuery',
      options: ({ queryParams }) => ({
        variables: generateParams({ queryParams })
      })
    }),
    graphql<Props>(gql(queries.totalCount), {
      name: 'totalCountQuery',
      options: ({ queryParams }) => ({
        variables: generateParams({ queryParams })
      })
    }),
    graphql(gql(mutations.riskIndicatorAdd), {
      name: 'addMutation'
    }),
    graphql(gql(mutations.riskIndicatorRemove), {
      name: 'removeMutation'
    }),
    graphql(gql(mutations.riskIndicatorUpdate), {
      name: 'editMutation'
    })
  )(ListContainer)
);
