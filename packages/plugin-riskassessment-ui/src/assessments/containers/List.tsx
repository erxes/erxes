import { Alert, confirm, EmptyState, Spinner } from '@erxes/ui/src';
import { IRouterProps } from '@erxes/ui/src/types';
import { router, withProps } from '@erxes/ui/src/utils/core';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';
import { generateParamsIds } from '../../common/utils';
import ListComponent from '../components/List';
import { mutations, queries } from '../graphql';

type Props = {
  queryParams: any;
  history: any;
} & IRouterProps;

type FinalProps = {
  listQuery: any;
  totalCount: any;
  removeAssessments: any;
} & Props;

type State = {};

class List extends React.Component<FinalProps, State> {
  constructor(props) {
    super(props);
  }
  render() {
    const {
      listQuery,
      totalCount,
      queryParams,
      history,
      removeAssessments
    } = this.props;

    if (listQuery.loading) {
      return <Spinner />;
    }

    if (listQuery.error) {
      return <EmptyState text={listQuery.error} icon="info-circle" />;
    }

    const remove = (ids: string[]) => {
      confirm(
        'this action will erase every data of assessments.Are you sure?'
      ).then(() => {
        removeAssessments({ variables: { ids } })
          .then(() => {
            Alert.success('Removed successfully');
          })
          .catch(err => {
            Alert.error(err.message);
          });
      });
    };

    const updatedProps = {
      list: listQuery?.riskAssessments || [],
      totalCount: totalCount?.riskAssessmentsTotalCount,
      queryParams,
      history,
      remove
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
  createdAtFrom: queryParams.createdAtFrom || undefined,
  createdAtTo: queryParams.createdAtTo || undefined,
  closedAtFrom: queryParams.closedAtFrom || undefined,
  closedAtTo: queryParams.closedAtTo || undefined,
  branchIds: generateParamsIds(queryParams.branchIds),
  departmentIds: generateParamsIds(queryParams.departmentIds),
  operationIds: generateParamsIds(queryParams.operationIds),
  tagIds: generateParamsIds(queryParams.tagIds),
  groupIds: generateParamsIds(queryParams.groupIds)
});

const refetchQueries = ({ queryParams }) => {
  return [
    {
      query: gql(queries.riskAssessments),
      variables: { ...generateParams({ queryParams }) }
    },
    {
      query: gql(queries.totalCount),
      variables: { ...generateParams({ queryParams }) }
    }
  ];
};

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
    }),
    graphql<Props>(gql(mutations.removeAssessments), {
      name: 'removeAssessments',
      options: ({ queryParams }) => ({
        refetchQueries: refetchQueries({ queryParams })
      })
    })
  )(List)
);
