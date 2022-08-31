import { Spinner } from '@erxes/ui/src';
import { withProps } from '@erxes/ui/src/utils/core';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';
import SubmissionsComponent from '../component/Submissions';
import { queries } from '../graphql';
type Props = {
    id:string
};

type FinalProps = {
    assignedUsers:any
} & Props;

class Submissions extends React.Component<FinalProps> {
  constructor(props) {
    super(props);
  }

  render() {

    const {assignedUsers} = this.props;

    if(assignedUsers.loading){
        return <Spinner objective/>
    }

    const updatedProps = {
        list:assignedUsers.riskConfirmitySubmissions.assignedUsers,
        isSelectedRiskAssessment:assignedUsers.riskConfirmitySubmissions.isSelectedRiskAssessment
    }

    return <SubmissionsComponent {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
  graphql<Props>(gql(queries.riskConfirmitySubmissions),{
    name:'assignedUsers',
    options:({id})=>({
        variables:{dealId:id}
    })
  })
  )(Submissions)
);
