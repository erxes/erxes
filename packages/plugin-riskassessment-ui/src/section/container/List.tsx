import { withCurrentUser } from '@erxes/ui/src';
import { IUser } from '@erxes/ui/src/auth/types';
import { isEnabled, withProps } from '@erxes/ui/src/utils/core';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';
import {
  ICardRiskConfirmitiesQueryResponse,
  IRiskSubmissionsQueryResponse
} from '../../common/types';
import SectionComponent from '../component/List';
import { queries } from '../graphql';
type Props = {
  mainType:string;
  mainTypeId: string;
  currentUser: IUser;
};

type FinalProps = {
  lists: ICardRiskConfirmitiesQueryResponse;
  submissions: IRiskSubmissionsQueryResponse;
} & Props;

class RiskAssessmentSection extends React.Component<FinalProps> {
  constructor(props) {
    super(props);
  }

  render() {
    const { lists, submissions, mainTypeId } = this.props;

    if (mainTypeId) {
      submissions.refetch();
    }

    const updatedProps = {
      ...this.props,
      cardId:this.props.mainTypeId,
      cardType:this.props.mainType,
      list: lists?.riskConfirmities || [],
      refetch: lists?.refetch,
      submissions: submissions.riskConfirmitySubmissions,
      refetchSubmissions: submissions.refetch
    };

    return <SectionComponent {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.riskConfirmities), {
      name: 'lists',
      skip: ({ mainTypeId }) => !mainTypeId,
      options: ({ mainTypeId,mainType }) => ({ variables: { cardId: mainTypeId,cardType:mainType } })
    }),
    graphql<Props>(gql(queries.riskConfirmitySubmissions), {
      name: 'submissions',
      skip: ({ mainTypeId }) => !mainTypeId,
      options: ({ mainTypeId,mainType }) => ({ variables: { cardId: mainTypeId,cardType:mainType } })
    })
  )(withCurrentUser(RiskAssessmentSection))
);
