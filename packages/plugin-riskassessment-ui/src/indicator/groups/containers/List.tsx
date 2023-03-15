import { Alert, confirm, EmptyState, Spinner } from '@erxes/ui/src';
import { IRouterProps } from '@erxes/ui/src/types';
import { withProps } from '@erxes/ui/src/utils/core';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';
import { IIndicatorsGroupsQueryResponse } from '../common/types';
import { generateParams, refetchQueries } from '../common/utilss';
import ListComponent from '../components/List';
import { mutations, queries } from '../graphql';

type Props = {
  queryParams: any;
} & IRouterProps;

type FinalProps = {
  listQuery: IIndicatorsGroupsQueryResponse;
  removeGroups: any;
} & Props;

class List extends React.Component<FinalProps> {
  constructor(props) {
    super(props);
  }

  render() {
    const { listQuery, removeGroups, queryParams } = this.props;

    if (listQuery.loading) {
      return <Spinner />;
    }

    if (listQuery.error) {
      return <EmptyState text={listQuery.error} icon="info-circle" />;
    }

    const { riskIndicatorsGroups, riskIndicatorsGroupsTotalCount } = listQuery;

    const remove = ids => {
      confirm().then(() => {
        removeGroups({ variables: { ids } })
          .then(() => {
            Alert.success('You successfully remove groups of indicators');
          })
          .catch(err => {
            Alert.error(err.message);
          });
      });
    };

    const updatedProps = {
      ...this.props,
      list: riskIndicatorsGroups,
      totalCount: riskIndicatorsGroupsTotalCount,
      queryParams,
      remove
    };

    return <ListComponent {...updatedProps} />;
  }
}

export default withProps(
  compose(
    graphql<Props>(gql(queries.list), {
      name: 'listQuery',
      options: ({ queryParams }) => ({
        variables: generateParams(queryParams)
      })
    }),
    graphql<Props>(gql(mutations.removeGroups), {
      name: 'removeGroups',
      options: ({ queryParams }) => ({
        refetchQueries: refetchQueries(queryParams)
      })
    })
  )(List)
);
