import { Spinner } from '@erxes/ui/src';
import { withProps } from '@erxes/ui/src/utils/core';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';
import { RiskAssessmentSubmitFormQueryResponse } from '../../common/types';
import { AssessmentFilters } from '../common/types';
import RiskAssessmentFormComponent from '../components/RiskAssessmentForm';
import { queries } from '../graphql';

type Props = {
  filters: AssessmentFilters;
  closeModal: () => void;
  onlyPreview?: boolean;
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
      filters,
      closeModal,
      onlyPreview
    } = this.props;

    if (formDetailQueryResponse.loading) {
      return <Spinner />;
    }

    const { riskAssessmentSubmitForm } = formDetailQueryResponse;

    const updatedProps = {
      indicators: riskAssessmentSubmitForm,
      filters,
      closeModal,
      onlyPreview
    };

    return <RiskAssessmentFormComponent {...updatedProps} />;
  }
}

export default withProps(
  compose(
    graphql<Props>(gql(queries.riskAssessmentSubmitForm), {
      name: 'formDetailQueryResponse',
      options: ({
        filters: { cardId, cardType, userId, riskAssessmentId }
      }) => ({
        variables: { cardId, cardType, userId, riskAssessmentId }
      })
    })
  )(RiskAssessmentForm)
);
