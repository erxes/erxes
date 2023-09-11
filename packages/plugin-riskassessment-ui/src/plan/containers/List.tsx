import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { Alert, EmptyState, Spinner, confirm } from '@erxes/ui/src';
import { QueryResponse } from '@erxes/ui/src/types';
import { withProps } from '@erxes/ui/src/utils/core';
import { generatePaginationParams } from '@erxes/ui/src/utils/router';
import * as compose from 'lodash.flowright';
import React from 'react';
import ListComponent from '../components/List';
import { mutations, queries } from '../graphql';
import client from '@erxes/ui/src/apolloClient';
import { generateParamsIds } from '../../common/utils';

type Props = {
  history: any;
  queryParams: string;
};

type FinalProps = {
  plansQueryResponse: {
    riskAssessmentPlans: any;
    riskAssessmentPlansTotalCount: number;
  } & QueryResponse;
  removePlansMutationsResponse: any;
  duplicatePlansMutationsResponse: any;
  changeStatusMutationsResponse: any;
} & Props;

class List extends React.Component<FinalProps> {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      removePlansMutationsResponse,
      duplicatePlansMutationsResponse,
      changeStatusMutationsResponse,
      plansQueryResponse,
      queryParams,
      history
    } = this.props;

    if (plansQueryResponse.loading) {
      return <Spinner />;
    }

    if (plansQueryResponse.error) {
      return <EmptyState text="Something went wrong" />;
    }

    const removePlans = ids => {
      removePlansMutationsResponse({ variables: { ids } })
        .then(() => {
          Alert.success('Removed successfully');
        })
        .catch(err => {
          Alert.error(err.message);
        });
    };

    const duplicatePlan = id => {
      confirm().then(() => {
        duplicatePlansMutationsResponse({ variables: { id } })
          .then(() => {
            Alert.success('Duplicated successfully');
          })
          .catch(err => {
            Alert.error(err.message);
          });
      });
    };

    const changeStatus = (_id, status) => {
      confirm().then(() => {
        changeStatusMutationsResponse({ variables: { _id, status } })
          .then(() => {
            Alert.success('Status changed successfully');
          })
          .catch(err => {
            Alert.error(err.message);
          });
      });
    };

    const updatedProps = {
      history,
      queryParams,
      removePlans,
      duplicatePlan,
      changeStatus,
      list: plansQueryResponse?.riskAssessmentPlans || [],
      totalCount: plansQueryResponse.riskAssessmentPlansTotalCount || 0
    };

    return <ListComponent {...updatedProps} />;
  }
}

const refetchQueries = queryParams => [
  {
    query: gql(queries.plans),
    variables: generateParams(queryParams || {})
  }
];

const generateDateParams = date => {
  if (!date || date === 'NaN') {
    return undefined;
  }

  return date;
};

const generateParams = queryParams => ({
  ...generatePaginationParams(queryParams),
  isArchived: queryParams.isArchived === 'true',
  searchValue: queryParams.searchValue,
  sortField: queryParams.sortField,
  sortDirection: queryParams.sortDirection
    ? Number(queryParams.sortDirection)
    : undefined,
  plannerIds: generateParamsIds(queryParams.plannerIds),
  status: queryParams?.status,
  structureIds: generateParamsIds(queryParams.structureIds),
  createDateFrom: generateDateParams(queryParams.createDateFrom),
  createDateTo: generateDateParams(queryParams.createDateTo),
  startDateFrom: generateDateParams(queryParams.startDateFrom),
  startDateTo: generateDateParams(queryParams.startDateTo),
  closeDateFrom: generateDateParams(queryParams.closeDateFrom),
  closeDateTo: generateDateParams(queryParams.closeDateTo),
  createdAtFrom: generateDateParams(queryParams.createdAtFrom),
  createdAtTo: generateDateParams(queryParams.createdAtTo),
  modifiedAtFrom: generateDateParams(queryParams.modifiedAtFrom),
  modifiedAtTo: generateDateParams(queryParams.modifiedAtTo)
});

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.plans), {
      name: 'plansQueryResponse',
      options: ({ queryParams }) => ({
        variables: generateParams(queryParams || {})
      })
    }),
    graphql<Props>(gql(mutations.removePlan), {
      name: 'removePlansMutationsResponse',
      options: ({ queryParams }) => ({
        refetchQueries: refetchQueries(queryParams)
      })
    }),
    graphql<Props>(gql(mutations.duplicatePlan), {
      name: 'duplicatePlansMutationsResponse',
      options: ({ queryParams }) => ({
        refetchQueries: refetchQueries(queryParams)
      })
    }),
    graphql<Props>(gql(mutations.changeStatus), {
      name: 'changeStatusMutationsResponse',
      options: ({ queryParams }) => ({
        refetchQueries: refetchQueries(queryParams)
      })
    })
  )(List)
);
