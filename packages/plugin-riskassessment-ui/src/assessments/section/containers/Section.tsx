import React from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { IRouterProps } from '@erxes/ui/src/types';
import { withProps } from '@erxes/ui/src/utils/core';
import { queries } from '../graphql';
import { RiskAssessmentQueryResponse } from '../../common/types';
import SectionComponent from '../components/Section';
import { Spinner } from '@erxes/ui/src';

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
      riskAssessment,
      cardType: mainType,
      cardId: mainTypeId
    };

    return <SectionComponent {...updatedProps} />;
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
