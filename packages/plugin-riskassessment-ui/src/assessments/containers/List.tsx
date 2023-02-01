import { IRouterProps } from '@erxes/ui/src/types';
import React from 'react';
import { router, withProps } from '@erxes/ui/src/utils/core';
import * as compose from 'lodash.flowright';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { queries } from '../graphql';
import ListComponent from '../components/List';
import { Spinner } from '@erxes/ui/src';
type Props = {
  queryParams: any;
  history: any;
} & IRouterProps;

type FinalProps = {
  listQuery: any;
  totalCount: any;
} & Props;

type State = {};

class List extends React.Component<FinalProps, State> {
  constructor(props) {
    super(props);
  }
  render() {
    const { listQuery, totalCount, queryParams, history } = this.props;

    if (listQuery.loading) {
      return <Spinner />;
    }

    const updatedProps = {
      queryParams,
      history,
      list: listQuery?.riskAssessments || [],
      totalCount: totalCount?.riskAssessmentsTotalCount
    };

    return <ListComponent {...updatedProps} />;
  }
}

const generateParamsIds = ids => {
  if (!ids?.length) {
    return undefined;
  }
  if (typeof ids === 'string') {
    return [ids];
  }
  return ids;
};

export const generateParams = ({ queryParams }) => ({
  ...router.generatePaginationParams(queryParams || {}),
  cardType: queryParams?.cardType,
  riskIndicatorIds: queryParams?.riskIndicatorIds,
  status: queryParams?.status,
  searchValue: queryParams?.searchValue,
  sortField: queryParams?.sortField,
  sortDirection: Number(queryParams?.sortDirection) || undefined,
  createdFrom: queryParams.createdFrom || undefined,
  createdTo: queryParams.createdTo || undefined,
  closedFrom: queryParams.closedFrom || undefined,
  closedTo: queryParams.closedTo || undefined,
  branchIds: generateParamsIds(queryParams.branchIds),
  departmentIds: generateParamsIds(queryParams.departmentIds),
  operationIds: generateParamsIds(queryParams.operationIds)
});

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.riskAssessments), {
      name: 'listQuery',
      options: ({ queryParams }) => ({
        variables: generateParams({ queryParams })
      })
    }),
    graphql<Props>(gql(queries.totalCount), {
      name: 'totalCount',
      options: ({ queryParams }) => ({
        variables: generateParams({ queryParams })
      })
    })
  )(List)
);
