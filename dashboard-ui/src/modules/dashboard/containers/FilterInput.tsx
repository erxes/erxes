import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import Spinner from 'modules/common/components/Spinner';
import React from 'react';
import { graphql } from 'react-apollo';
import FilterInput from '../components/QueryBuilder/FilterInput';
import { queries } from '../graphql';

type Props = {
  member?: any;
  updateMethods: any;
  type: string;
};

type FinalProps = {
  dashboardFiltersQuery: any;
} & Props;

class FilterInputContainer extends React.Component<FinalProps, {}> {
  render() {
    const { dashboardFiltersQuery } = this.props;

    if (dashboardFiltersQuery && dashboardFiltersQuery.loading) {
      return <Spinner objective={true} />;
    }

    const filters = dashboardFiltersQuery.dashboardFilters || [];

    const updatedProps = {
      ...this.props,
      filters
    };

    return <FilterInput {...updatedProps} />;
  }
}

export default compose(
  graphql<Props, any, { type: string }>(gql(queries.dashboardFilters), {
    name: 'dashboardFiltersQuery',
    skip: ({ type }) => !type,
    options: ({ type }: { type: string }) => ({
      variables: {
        type
      }
    })
  })
)(FilterInputContainer);
