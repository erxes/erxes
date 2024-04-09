import * as compose from 'lodash.flowright';

import {
  BranchesMainQueryResponse,
  DepartmentsMainQueryResponse,
  PositionsMainQueryResponse,
  UnitsMainQueryResponse,
} from '@erxes/ui/src/team/types';
import { EmptyState, Spinner } from '@erxes/ui/src';

import React from 'react';
import SettingsSideBar from '../../components/common/SettingsSideBar';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { queries } from '@erxes/ui/src/team/graphql';
import { withProps } from '@erxes/ui/src/utils/core';

type FinalProps = {
  branchListQuery: BranchesMainQueryResponse;
  unitListQuery: UnitsMainQueryResponse;
  departmentListQuery: DepartmentsMainQueryResponse;
  positionListQuery: PositionsMainQueryResponse;
};

class SettingsSideBarContainer extends React.Component<FinalProps> {
  render() {
    const {
      branchListQuery,
      unitListQuery,
      departmentListQuery,
      positionListQuery,
    } = this.props;

    if (
      branchListQuery.loading ||
      unitListQuery.loading ||
      departmentListQuery.loading ||
      positionListQuery.loading
    ) {
      return <Spinner />;
    }

    if (
      branchListQuery.error ||
      unitListQuery.error ||
      departmentListQuery.error ||
      positionListQuery.error
    ) {
      return (
        <EmptyState image="/images/actions/5.svg" text="Something went wrong" />
      );
    }

    return (
      <SettingsSideBar
        branchTotalCount={branchListQuery?.branchesMain?.totalCount || 0}
        unitTotalCount={unitListQuery?.unitsMain?.totalCount || 0}
        departmentTotalCount={
          departmentListQuery?.departmentsMain?.totalCount || 0
        }
        positionTotalCount={positionListQuery?.positionsMain?.totalCount || 0}
      />
    );
  }
}

export default withProps<{}>(
  compose(
    graphql<{}>(gql(queries.branchesMain), {
      name: 'branchListQuery',
      options: () => ({
        variables: {
          withoutUserFilter: true,
        },
      }),
    }),
    graphql<{}>(gql(queries.unitsMain), {
      name: 'unitListQuery',
      options: () => ({
        variables: {
          withoutUserFilter: true,
        },
      }),
    }),
    graphql<{}>(gql(queries.departmentsMain), {
      name: 'departmentListQuery',
      options: () => ({
        variables: {
          withoutUserFilter: true,
        },
      }),
    }),
    graphql<{}>(gql(queries.positionsMain), {
      name: 'positionListQuery',
      options: () => ({
        variables: {
          withoutUserFilter: true,
        },
      }),
    }),
  )(SettingsSideBarContainer),
);
