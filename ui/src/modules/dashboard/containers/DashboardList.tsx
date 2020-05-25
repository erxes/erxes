import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import ButtonMutate from 'modules/common/components/ButtonMutate';
import { IButtonMutateProps, IRouterProps } from 'modules/common/types';
import { withProps } from 'modules/common/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import DashboardList from '../components/DashboardList';
import { mutations, queries } from '../graphql';
import { DashboardsQueryResponse } from '../types';

type Props = { queryParams: any } & IRouterProps;

type FinalProps = {
  dashboardsQuery?: DashboardsQueryResponse;
} & Props;

class DashboardListContainer extends React.Component<FinalProps> {
  render() {
    const { dashboardsQuery } = this.props;

    const dashboards = dashboardsQuery ? dashboardsQuery.dashboards || [] : [];

    const renderAddButton = ({
      name,
      values,
      isSubmitted,
      callback,
      object
    }: IButtonMutateProps) => {
      const afterSave = () => {
        if (callback) {
          callback();
        }

        if (dashboardsQuery) {
          dashboardsQuery.refetch();
        }
      };

      return (
        <ButtonMutate
          mutation={mutations.dashboardAdd}
          variables={values}
          callback={afterSave}
          refetchQueries={[]}
          isSubmitted={isSubmitted}
          uppercase={false}
          icon="plus-circle"
          type="submit"
          successMessage={`You successfully ${
            object ? 'updated' : 'added'
          } a ${name}`}
        />
      );
    };

    return (
      <DashboardList
        renderAddButton={renderAddButton}
        dashboards={dashboards}
      />
    );
  }
}

export default withRouter(
  withProps<Props>(
    compose(
      graphql<Props, DashboardsQueryResponse>(gql(queries.dashboards), {
        name: 'dashboardsQuery'
      })
    )(DashboardListContainer)
  )
);
