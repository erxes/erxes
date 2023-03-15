import { EmptyState, Spinner } from '@erxes/ui/src';
import { IRouterProps } from '@erxes/ui/src/types';
import { router, withProps } from '@erxes/ui/src/utils/core';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';
import { generateParamsIds } from '../../common/utils';
import ListComponent from '../components/List';
import { queries } from '../graphql';

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

    if (listQuery.error) {
      return <EmptyState text={listQuery.error} icon="info-circle" />;
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
  operationIds: generateParamsIds(queryParams.operationIds),
  tagIds: generateParamsIds(queryParams.tagIds)
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
