import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import Spinner from 'modules/common/components/Spinner';
import { withProps } from 'modules/common/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import { queries } from '../graphql';
import { DashboardDetailsQueryResponse } from '../types';
import DashboardDetail from '../components/DashboardDetail';

type Props = {
  id: string;
};

type FinalProps = {
  dashboardDetailQuery: DashboardDetailsQueryResponse;
} & Props;

class CustomerDetailsContainer extends React.Component<FinalProps, {}> {
  render() {
    const { dashboardDetailQuery } = this.props;

    if (dashboardDetailQuery.loading) {
      return <Spinner />;
    }

    const updatedProps = {
      ...this.props,
      dashboard: dashboardDetailQuery.dashboardDetails || {}
    };

    return <DashboardDetail {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, DashboardDetailsQueryResponse, { _id: string }>(
      gql(queries.dashboardDetails),
      {
        name: 'dashboardDetailQuery',
        options: ({ id }: { id: string }) => ({
          variables: {
            _id: id
          }
        })
      }
    )
  )(CustomerDetailsContainer)
);
