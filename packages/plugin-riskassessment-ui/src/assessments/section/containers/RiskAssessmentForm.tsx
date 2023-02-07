import React from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { withProps } from '@erxes/ui/src/utils/core';
import { queries } from '../graphql';
import { RiskAssessmentSubmitFormQueryResponse } from '../../common/types';
import { Spinner } from '@erxes/ui/src';
import RiskAssessmentFormComponent from '../components/RiskAssessmentForm';

type Props = {
  cardId: string;
  cardType: string;
  riskAssessmentId: string;
  userId: string;
  closeModal: () => void;
};

type FinalProps = {
  formDetailQueryResponse: RiskAssessmentSubmitFormQueryResponse;
} & Props;

class RiskAssessmentForm extends React.Component<FinalProps> {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      formDetailQueryResponse,
      riskAssessmentId,
      userId,
      cardId,
      cardType,
      closeModal
    } = this.props;

    if (formDetailQueryResponse.loading) {
      return <Spinner />;
    }

    const { riskAssessmentSubmitForm } = formDetailQueryResponse;

    const updatedProps = {
      indicators: riskAssessmentSubmitForm,
      riskAssessmentId,
      userId,
      cardId,
      cardType,
      closeModal
    };

    return <RiskAssessmentFormComponent {...updatedProps} />;
  }
}

export default withProps(
  compose(
    graphql<Props>(gql(queries.riskAssessmentSubmitForm), {
      name: 'formDetailQueryResponse',
      options: ({ closeModal, ...props }) => ({
        variables: { ...props }
      })
    })
  )(RiskAssessmentForm)
);
