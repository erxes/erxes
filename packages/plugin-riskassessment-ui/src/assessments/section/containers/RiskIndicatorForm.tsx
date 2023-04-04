import { Alert, confirm, EmptyState, Spinner } from '@erxes/ui/src';
import { withProps } from '@erxes/ui/src/utils/core';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';
import { RiskAssessmentIndicatorFormQueryResponse } from '../../common/types';
import { AssessmentFilters } from '../common/types';
import IndicatorForm from '../components/RiskIndicatorForm';
import { mutations, queries } from '../graphql';
type Props = {
  filters: AssessmentFilters;
  closeModal: () => void;
  onlyPreview?: boolean;
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
    const {
      indicatorFormQueryResponse,
      closeModal,
      onlyPreview,
      filters
    } = this.props;

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
      return <EmptyState text="" />;
    }

    const submitForm = doc => {
      const { saveSubmission, filters } = this.props;

      let confirmText = 'Are you sure';

      if (
        doc.formSubmissions &&
        riskAssessmentIndicatorForm?.withDescription &&
        Object.values(doc.formSubmissions).some(
          (submission: any) => !submission.description
        )
      ) {
        confirmText =
          'Are you sure submit without type some text on description to fields';
      }

      confirm(confirmText).then(() => {
        const variables = {
          ...doc,
          ...filters
        };
        saveSubmission({ variables }).catch(err => Alert.error(err.message));
      });
    };

    const updatedProps = {
      fields: riskAssessmentIndicatorForm?.fields,
      submittedFields: riskAssessmentIndicatorForm?.submittedFields,
      withDescription: riskAssessmentIndicatorForm?.withDescription,
      indicatorId: filters.indicatorId || '',
      submitForm,
      closeModal,
      onlyPreview
    };

    return <IndicatorForm {...updatedProps} />;
  }
}

const refetchQueries = ({
  cardId,
  cardType,
  riskAssessmentId,
  userId,
  indicatorId
}) => [
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
  },
  {
    query: gql(queries.riskAssessmentIndicatorForm),
    variables: { indicatorId, riskAssessmentId, userId }
  }
];

export default withProps(
  compose(
    graphql<Props>(gql(queries.riskAssessmentIndicatorForm), {
      name: 'indicatorFormQueryResponse',
      options: ({ filters: { indicatorId, riskAssessmentId, userId } }) => ({
        variables: { indicatorId, riskAssessmentId, userId },
        fetchPolicy: 'cache-and-network'
      })
    }),
    graphql<Props>(gql(mutations.riskFormSaveSubmission), {
      name: 'saveSubmission',
      options: ({
        filters: { indicatorId, riskAssessmentId, userId, cardId, cardType }
      }) => ({
        variables: { indicatorId, riskAssessmentId, userId },
        refetchQueries: refetchQueries({
          riskAssessmentId,
          cardId,
          cardType,
          userId,
          indicatorId
        })
      })
    })
  )(RiskIndicatorForm)
);
