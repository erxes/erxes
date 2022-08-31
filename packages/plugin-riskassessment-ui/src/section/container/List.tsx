import { isEnabled, withProps } from '@erxes/ui/src/utils/core';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';
import { IDealRiskConfirmitiesQueryResponse } from '../../common/types';
import SectionComponent from '../component/List';
import { queries } from '../graphql';
type Props = {
  id: string;
};

type FinalProps = {
  lists: IDealRiskConfirmitiesQueryResponse;
  submissions:any
} & Props;

class RiskAssessmentSection extends React.Component<FinalProps> {
  constructor(props) {
    super(props);
  }

  render() {
    const { lists ,submissions} = this.props;

    const updatedProps = {
      ...this.props,
      list: lists?.riskConfirmities || [],
      refetch: lists?.refetch,
      submissions:submissions.riskConfirmitySubmissions
    };

    return <SectionComponent {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.riskConfirmities), {
      name: 'lists',
      skip: ({ id }) => !isEnabled('riskassessment') || !id,
      options: ({ id }) => ({ variables: { cardId: id } }),
    }),
    graphql<Props>(gql(queries.riskConfirmitySubmissions), {
      name: 'submissions',
      skip: ({ id }) => !id,
      options: ({ id }) => ({ variables: { dealId: id } }),
    })
  )(RiskAssessmentSection)
);
