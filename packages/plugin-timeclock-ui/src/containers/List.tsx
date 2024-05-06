import * as compose from "lodash.flowright";

import {
  BranchesQueryResponse,
  DepartmentsQueryResponse,
  PayDatesQueryResponse,
  ScheduleConfigQueryResponse,
  TimeClockMutationResponse,
} from "../types";

import { IUser } from "@erxes/ui/src/auth/types";
import List from "../components/List";
import React from "react";
import Spinner from "@erxes/ui/src/components/Spinner";
import erxesQuery from "@erxes/ui/src/team/graphql/queries";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import { queries } from "../graphql";
import { removeParams } from "@erxes/ui/src/utils/router";
import withCurrentUser from "@erxes/ui/src/auth/containers/withCurrentUser";
import { withProps } from "@erxes/ui/src/utils";

type Props = {
  currentUser: IUser;
  queryParams: any;
  searchValue: string;

  route?: string;
  navigate: any;
  location: any;
  startTime: Date;
  stopTime: Date;
  timeId: string;
  userId: string;
  searchFilter: string;
  checkUserPermission?: boolean;
};

type FinalProps = {
  listDepartmentsQuery: DepartmentsQueryResponse;
  listBranchesQuery: BranchesQueryResponse;
  listScheduleConfigsQuery: ScheduleConfigQueryResponse;
} & Props &
  TimeClockMutationResponse;

class ListContainer extends React.Component<FinalProps> {
  constructor(props) {
    super(props);
  }

  componentDidUpdate(prevProps): void {
    if (prevProps.route !== this.props.route) {
      removeParams(this.props.navigate, this.props.location, "page", "perPage");
    }
  }

  render() {
    const {
      listBranchesQuery,
      listScheduleConfigsQuery,
      listDepartmentsQuery,
      currentUser,
    } = this.props;

    if (listBranchesQuery && listBranchesQuery.loading) {
      return <Spinner />;
    }

    const currentUserId = currentUser._id;

    const updatedProps = {
      ...this.props,
      isCurrentUserAdmin: isCurrentUserAdmin(this.props),
      isCurrentUserSupervisor:
        this.props.currentUser.permissionActions &&
        this.props.currentUser.permissionActions["manageTimeclocks"],
      currentUserId,

      branches:
        (isCurrentUserAdmin(this.props)
          ? listBranchesQuery.branches
          : listBranchesQuery.timeclockBranches) || [],
      departments:
        (isCurrentUserAdmin(this.props)
          ? listDepartmentsQuery.departments
          : listDepartmentsQuery.timeclockDepartments) || [],

      loading: listBranchesQuery.loading,
    };

    return <List {...updatedProps} />;
  }
}

const isCurrentUserAdmin = (props: any) => {
  return (
    (props.currentUser?.permissionActions &&
      props.currentUser?.permissionActions["showTimeclocks"] &&
      props.currentUser?.permissionActions["manageTimeclocks"]) ||
    false
  );
};

export default withProps<Props>(
  compose(
    graphql<Props, BranchesQueryResponse, { searchValue: string }>(
      gql(erxesQuery.branches),
      {
        name: "listBranchesQuery",
        skip: (props) => !isCurrentUserAdmin(props),
        options: ({ searchValue }) => ({
          variables: { searchValue },
          fetchPolicy: "network-only",
        }),
      }
    ),

    graphql<Props, BranchesQueryResponse, { searchValue: string }>(
      gql(erxesQuery.departments),
      {
        name: "listDepartmentsQuery",
        skip: (props) => !isCurrentUserAdmin(props),
        options: ({ searchValue }) => ({
          variables: { searchValue },
          fetchPolicy: "network-only",
        }),
      }
    ),

    graphql<Props, PayDatesQueryResponse>(gql(queries.timeclockBranches), {
      name: "listBranchesQuery",
      skip: (props) => isCurrentUserAdmin(props),
      options: ({ searchValue }) => ({
        variables: { searchValue },
        fetchPolicy: "network-only",
      }),
    }),

    graphql<Props, PayDatesQueryResponse>(gql(queries.timeclockDepartments), {
      name: "listDepartmentsQuery",
      skip: (props) => isCurrentUserAdmin(props),
      options: ({ searchValue }) => ({
        variables: { searchValue },
        fetchPolicy: "network-only",
      }),
    }),

    graphql<Props, PayDatesQueryResponse>(gql(queries.scheduleConfigs), {
      name: "listScheduleConfigsQuery",
      options: () => ({
        fetchPolicy: "network-only",
      }),
    })
  )(withCurrentUser(ListContainer))
);
