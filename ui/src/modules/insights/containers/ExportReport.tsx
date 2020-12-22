import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { getEnv } from 'modules/common/utils';
import { queries as userQueries } from 'modules/settings/team/graphql';
import { UsersQueryResponse } from 'modules/settings/team/types';
import queryString from 'query-string';
import React from 'react';
import { graphql } from 'react-apollo';
import { BrandsQueryResponse } from '../../settings/brands/types';
import ExportReport from '../components/ExportReport';
import { queries } from '../graphql';
import { IQueryParams } from '../types';

type Props = {
  history: any;
  brandsQuery: BrandsQueryResponse;
  usersQuery: UsersQueryResponse;
  queryParams: IQueryParams;
};

class ExportReportContainer extends React.Component<Props> {
  render() {
    const { history, brandsQuery, queryParams, usersQuery } = this.props;

    const { REACT_APP_API_URL } = getEnv();

    const exportReport = (args: { type: string; userId?: string }) => {
      const stringified = queryString.stringify({ ...queryParams, ...args });

      window.open(
        `${REACT_APP_API_URL}/insights-export?${stringified}`,
        '_blank'
      );
    };

    const extendedProps = {
      history,
      queryParams,
      brands: brandsQuery.brands || [],
      users: usersQuery.users || [],
      exportReport
    };

    return <ExportReport {...extendedProps} />;
  }
}

export default compose(
  graphql<Props, BrandsQueryResponse>(gql(queries.brands), {
    name: 'brandsQuery'
  }),
  graphql<Props, UsersQueryResponse>(gql(userQueries.users), {
    name: 'usersQuery'
  })
)(ExportReportContainer);
