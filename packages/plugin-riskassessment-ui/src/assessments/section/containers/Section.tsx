import { Spinner } from '@erxes/ui/src';
import ErrorBoundary from '@erxes/ui/src/components/ErrorBoundary';
import { IRouterProps } from '@erxes/ui/src/types';
import { withProps } from '@erxes/ui/src/utils/core';
import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import { RiskAssessmentQueryResponse } from '../../common/types';
import SectionComponent from '../components/Section';
import { queries } from '../graphql';

type Props = {
  queryParams: any;
  mainTypeId: string;
  mainType: string;
} & IRouterProps;

type FinalProps = {
  riskAssessmentQueryResponse: RiskAssessmentQueryResponse;
} & Props;

class Section extends React.Component<FinalProps> {
  constructor(props) {
    super(props);
  }

  render() {
    const { riskAssessmentQueryResponse, mainType, mainTypeId } = this.props;
    if (riskAssessmentQueryResponse.loading) {
      return <Spinner />;
    }

    const { riskAssessment } = riskAssessmentQueryResponse;

    const updatedProps = {
      riskAssessments: riskAssessment,
      cardType: mainType,
      cardId: mainTypeId
    };

    return (
      <ErrorBoundary>
        <SectionComponent {...updatedProps} />
      </ErrorBoundary>
    );
  }
}

export default withProps(
  compose(
    graphql<Props>(gql(queries.riskAssessment), {
      name: 'riskAssessmentQueryResponse',
      skip: ({ mainTypeId }) => !mainTypeId,
      options: ({ mainType, mainTypeId }) => ({
        variables: { cardType: mainType, cardId: mainTypeId }
      })
    })
  )(Section)
);
