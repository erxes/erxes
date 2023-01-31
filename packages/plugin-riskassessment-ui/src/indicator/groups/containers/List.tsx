import React from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { IRouterProps } from '@erxes/ui/src/types';
import { withProps } from '@erxes/ui/src/utils/core';
import { mutations, queries } from '../graphql';
import { Alert, confirm, Spinner } from '@erxes/ui/src';
import { IIndicatorsGroupsQueryResponse } from '../common/types';
import ListComponent from '../components/List';
import { generatePaginationParams } from '@erxes/ui/src/utils/router';

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
    const { listQuery, removeGroups } = this.props;

    if (listQuery.loading) {
      return <Spinner />;
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
      remove
    };

    return <ListComponent {...updatedProps} />;
  }
}

const generateParams = queryParams => ({
  ...generatePaginationParams(queryParams || []),
  searchValue: queryParams?.searchValue
});

export default withProps(
  compose(
    graphql<Props>(gql(queries.list), {
      name: 'listQuery',
      options: ({ queryParams }) => ({
        variables: generateParams(queryParams)
      })
    }),
    graphql<Props>(gql(mutations.removeGroups), {
      name: 'removeGroups'
    })
  )(List)
);
