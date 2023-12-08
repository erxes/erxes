import withCurrentUser from 'modules/auth/containers/withCurrentUser';
import { IUser } from 'modules/auth/types';
import React from 'react';
import Welcome from '../components/Welcome';
import * as compose from 'lodash.flowright';
import { withProps } from '@erxes/ui/src/utils/core';
import { graphql } from '@apollo/client/react/hoc';
import { gql } from '@apollo/client';
import { queries } from '@erxes/ui/src/team/graphql';
import {
  BranchesMainQueryResponse,
  DepartmentsMainQueryResponse
} from '@erxes/ui/src/team/types';
import { Spinner } from '@erxes/ui/src';

type Props = {
  currentUser: IUser;
};

type FinalProps = {
  branchListQuery: BranchesMainQueryResponse;
  departmentListQuery: DepartmentsMainQueryResponse;
} & Props;

class WelcomeContainer extends React.Component<FinalProps> {
  render() {
    const { currentUser, branchListQuery, departmentListQuery } = this.props;

    if (branchListQuery.loading || departmentListQuery.loading) {
      return <Spinner />;
    }

    return (
      <Welcome
        currentUser={currentUser}
        branchesLength={(branchListQuery?.branchesMain?.list || []).length || 0}
        departmentLength={
          (departmentListQuery?.departmentsMain?.list || []).length || 0
        }
      />
    );
  }
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.branchesMain), {
      name: 'branchListQuery',
      options: () => ({
        variables: {
          searchValue: '',
          withoutUserFilter: true
        }
      })
    }),
    graphql<Props>(gql(queries.departmentsMain), {
      name: 'departmentListQuery',
      options: () => ({
        variables: {
          searchValue: '',
          withoutUserFilter: true
        }
      })
    })
  )(withCurrentUser(WelcomeContainer))
);
