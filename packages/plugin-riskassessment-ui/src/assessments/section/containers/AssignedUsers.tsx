import * as compose from "lodash.flowright";

import { EmptyState, Spinner, withCurrentUser } from "@erxes/ui/src";
import {
  RiskAssessmentAssignedMembersQueryResponse,
  RiskAssessmentTypes,
} from "../../common/types";

import AssignedMembersComponent from "../components/AssigneMembers";
import { IUser } from "@erxes/ui/src/auth/types";
import React from "react";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import { queries } from "../graphql";
import { withProps } from "@erxes/ui/src/utils/core";

type Props = {
  riskAssessments: RiskAssessmentTypes[];
  cardId: string;
  cardType: string;
};

type FinalProps = {
  assignedMembersQueryResponse: RiskAssessmentAssignedMembersQueryResponse;
  currentUser: IUser;
} & Props;

class AssignedMembers extends React.Component<FinalProps> {
  render() {
    const {
      assignedMembersQueryResponse,
      currentUser,
      cardId,
      cardType,
      riskAssessments,
    } = this.props;

    if (assignedMembersQueryResponse.loading) {
      return <Spinner />;
    }

    if (assignedMembersQueryResponse.error) {
      return <EmptyState text={"error"} />;
    }

    const { riskAssessmentAssignedMembers } = assignedMembersQueryResponse;

    const updatedProps = {
      assignedMembers: riskAssessmentAssignedMembers,
      currentUser,
      cardId,
      cardType,
      riskAssessments,
    };

    return <AssignedMembersComponent {...updatedProps} />;
  }
}

export default withProps(
  compose(
    graphql<Props>(gql(queries.riskAssessmentAssignedMembers), {
      name: "assignedMembersQueryResponse",
      options: (props) => ({
        fetchPolicy: "network-only",
        variables: { ...props },
      }),
    })
  )(withCurrentUser(AssignedMembers))
);
