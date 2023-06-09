import React from 'react';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { withProps } from '@erxes/ui/src/utils/core';
import * as compose from 'lodash.flowright';
import { queries } from '../graphql';
import { QueryResponse } from '@erxes/ui/src/types';
import { EmptyState, Spinner } from '@erxes/ui/src';
import ListComponent from '../components/List';

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
    const { plansQueryResponse } = this.props;

    if (plansQueryResponse.loading) {
      return <Spinner />;
    }

    if (plansQueryResponse.error) {
      return <EmptyState text="Something went wrong" />;
    }

    const updatedProps = {
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
