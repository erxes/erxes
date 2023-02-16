import React from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { withProps } from '@erxes/ui/src/utils/core';
import { queries } from '../graphql';
import { RiskAssessmentAssignedMembersQueryResponse } from '../../common/types';
import { Spinner, withCurrentUser } from '@erxes/ui/src';
import AssignedMembersComponent from '../components/AssigneMembers';
import { IUser } from '@erxes/ui/src/auth/types';

type Props = {
  riskAssessmentId: string;
  cardId: string;
  cardType: string;
};

type FinalProps = {
  assignedMembersQueryResponse: RiskAssessmentAssignedMembersQueryResponse;
  currentUser: IUser;
} & Props;

class AssignedMembers extends React.Component<FinalProps> {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      assignedMembersQueryResponse,
      currentUser,
      cardId,
      cardType,
      riskAssessmentId
    } = this.props;

    if (assignedMembersQueryResponse.loading) {
      return <Spinner />;
    }

    const { riskAssessmentAssignedMembers } = assignedMembersQueryResponse;

    const updatedProps = {
      assignedMembers: riskAssessmentAssignedMembers,
      currentUser,
      cardId,
      cardType,
      riskAssessmentId
    };

    return <AssignedMembersComponent {...updatedProps} />;
  }
}

export default withProps(
  compose(
    graphql<Props>(gql(queries.riskAssessmentAssignedMembers), {
      name: 'assignedMembersQueryResponse',
      options: props => ({
        fetchPolicy: 'network-only',
        variables: { ...props }
      })
    })
  )(withCurrentUser(AssignedMembers))
);
