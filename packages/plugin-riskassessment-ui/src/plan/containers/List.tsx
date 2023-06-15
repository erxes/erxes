import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { Alert, EmptyState, Spinner } from '@erxes/ui/src';
import { QueryResponse } from '@erxes/ui/src/types';
import { withProps } from '@erxes/ui/src/utils/core';
import { generatePaginationParams } from '@erxes/ui/src/utils/router';
import * as compose from 'lodash.flowright';
import React from 'react';
import ListComponent from '../components/List';
import { mutations, queries } from '../graphql';

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
} & Props;

class List extends React.Component<FinalProps> {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      removePlansMutationsResponse,
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

    const updatedProps = {
      history,
      queryParams,
      removePlans,
      list: plansQueryResponse?.riskAssessmentPlans || [],
      totalCount: plansQueryResponse.riskAssessmentPlansTotalCount || 0
    };

    return <ListComponent {...updatedProps} />;
  }
}

const refetchQueries = () => [
  {
    query: gql(queries.plans)
  }
];

const generateParams = queryParams => ({
  ...generatePaginationParams(queryParams),
  isArchived: queryParams.isArchived === 'true',
  sortField: queryParams.sortField,
  sortDirection: queryParams.sortDirection
    ? Number(queryParams.sortDirection)
    : undefined
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
      options: ({}) => ({
        refetchQueries: refetchQueries()
      })
    })
  )(List)
);
