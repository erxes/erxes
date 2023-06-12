import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { EmptyState, Spinner } from '@erxes/ui/src';
import { QueryResponse } from '@erxes/ui/src/types';
import { withProps } from '@erxes/ui/src/utils/core';
import * as compose from 'lodash.flowright';
import React from 'react';
import ListComponent from '../components/List';
import { queries } from '../graphql';

type Props = {
  history: any;
  queryParams: string;
};

type FinalProps = {
  plansQueryResponse: {
    riskAssessmentPlans: any;
    riskAssessmentPlansTotalCount: number;
  } & QueryResponse;
} & Props;

class List extends React.Component<FinalProps> {
  constructor(props) {
    super(props);
  }

  render() {
    const { plansQueryResponse, queryParams } = this.props;

    if (plansQueryResponse.loading) {
      return <Spinner />;
    }

    if (plansQueryResponse.error) {
      return <EmptyState text="Something went wrong" />;
    }

    const updatedProps = {
      queryParams,
      list: plansQueryResponse?.riskAssessmentPlans || [],
      totalCount: plansQueryResponse.riskAssessmentPlansTotalCount || 0
    };

    return <ListComponent {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.plans), {
      name: 'plansQueryResponse'
    })
  )(List)
);
