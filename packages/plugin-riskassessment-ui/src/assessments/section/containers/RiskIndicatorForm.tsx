import React from 'react';
import * as compose from 'lodash.flowright';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Spinner, confirm, Alert } from '@erxes/ui/src';
import { withProps } from '@erxes/ui/src/utils/core';
import { mutations, queries } from '../graphql';
import { RiskAssessmentIndicatorFormQueryResponse } from '../../common/types';
import IndicatorForm from '../components/RiskIndicatorForm';
type Props = {
  riskAssessmentId: string;
  indicatorId: string;
  userId: string;
  cardId: string;
  cardType: string;
  closeModal: () => void;
};

type FinalProps = {
  indicatorFormQueryResponse: RiskAssessmentIndicatorFormQueryResponse;
  saveSubmission: any;
} & Props;

class RiskIndicatorForm extends React.Component<FinalProps> {
  constructor(props) {
    super(props);
  }
  render() {
    const { indicatorFormQueryResponse, closeModal } = this.props;

    if (indicatorFormQueryResponse.loading) {
      return <Spinner />;
    }

    const {
      riskAssessmentIndicatorForm,
      loading,
      error
    } = indicatorFormQueryResponse;

    if (loading) {
      return <Spinner />;
    }

    if (error) {
      return;
    }

    const submitForm = doc => {
      const { saveSubmission, userId, cardId, cardType } = this.props;

      confirm().then(() => {
        const variables = {
          ...doc,
          userId,
          cardId,
          cardType
        };
        saveSubmission({ variables }).catch(err => Alert.error(err.message));
      });
    };

    const updatedProps = {
      fields: riskAssessmentIndicatorForm?.fields,
      submittedFields: riskAssessmentIndicatorForm?.submittedFields,
      customScoreField: riskAssessmentIndicatorForm?.customScoreField,
      submitForm,
      closeModal
    };

    return <IndicatorForm {...updatedProps} />;
  }
}

const refetchQueries = ({ cardId, cardType, riskAssessmentId, userId }) => [
  {
    query: gql(queries.riskAssessment),
    variables: { cardId, cardType }
  },
  {
    query: gql(queries.riskAssessmentAssignedMembers),
    variables: { cardId, cardType, riskAssessmentId }
  },
  {
    query: gql(queries.riskAssessmentSubmitForm),
    variables: { cardId, cardType, riskAssessmentId, userId }
  }
];

export default withProps(
  compose(
    graphql<Props>(gql(queries.riskAssessmentIndicatorForm), {
      name: 'indicatorFormQueryResponse',
      options: ({ indicatorId, riskAssessmentId, userId }) => ({
        variables: { indicatorId, riskAssessmentId, userId }
      })
    }),
    graphql<Props>(gql(mutations.riskFormSaveSubmission), {
      name: 'saveSubmission',
      options: ({
        indicatorId,
        riskAssessmentId,
        userId,
        cardId,
        cardType
      }) => ({
        variables: { indicatorId, riskAssessmentId, userId },
        refetchQueries: refetchQueries({
          riskAssessmentId,
          cardId,
          cardType,
          userId
        })
      })
    })
  )(RiskIndicatorForm)
);
