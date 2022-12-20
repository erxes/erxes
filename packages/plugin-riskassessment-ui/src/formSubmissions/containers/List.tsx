import { IRouterProps } from '@erxes/ui/src/types';
import React from 'react';
import { router, withProps } from '@erxes/ui/src/utils/core';
import * as compose from 'lodash.flowright';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { queries } from '../graphql';
import ListComponent from '../components/List';
type Props = {
  queryParams: any;
  history: any;
} & IRouterProps;

type FinalProps = {
  conformities: any;
  totalCount: any;
} & Props;

type State = {};

class List extends React.Component<FinalProps, State> {
  constructor(props) {
    super(props);
  }
  render() {
    const { conformities, totalCount, queryParams, history } = this.props;

    const updatedProps = {
      queryParams,
      history,
      list: conformities?.riskConformities || [],
      totalCount: totalCount?.riskConformitiesTotalCount
    };

    return <ListComponent {...updatedProps} />;
  }
}

export const generateParams = ({ queryParams }) => ({
  ...router.generatePaginationParams(queryParams || {}),
  cardType: queryParams?.cardType,
  riskAssessmentId: queryParams?.riskAssessmentId,
  status: queryParams?.status,
  searchValue: queryParams?.searchValue,
  sortField: queryParams?.sortField,
  sortDirection: Number(queryParams?.sortDirection) || undefined,
  createdFrom: queryParams.createdFrom || undefined,
  createdTo: queryParams.createdTo || undefined,
  closedFrom: queryParams.closedFrom || undefined,
  closedTo: queryParams.closedTo || undefined
});

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.conformities), {
      name: 'conformities',
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
