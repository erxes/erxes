import { Alert, Spinner } from '@erxes/ui/src';
import { withProps } from '@erxes/ui/src/utils/core';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';
import { IRiskFormDetailQueryResponse } from '../../common/types';
import SubmitForm from '../component/SubmitForm';
import { mutations, queries } from '../graphql';
type Props = {
  cardId: string;
  cardType: string;
  closeModal: () => void;
  currentUserId?: string;
  refetch: () => void;
  refetchSubmissions: () => void;
  riskAssessmentId?: string;
  isSubmitted?: boolean;
};

type FinalProps = {
  formDetailQuery: IRiskFormDetailQueryResponse;
  saveFormSubmissions: any;
} & Props;

class Submissions extends React.Component<FinalProps> {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      formDetailQuery,
      saveFormSubmissions,
      cardId,
      cardType,
      closeModal,
      currentUserId,
      // refetch,
      // refetchSubmissions,
      // riskAssessmentId,
      isSubmitted
    } = this.props;

    const formSubmissionsSave = doc => {
      const variables = {
        ...doc,
        cardId,
        cardType,
        userId: currentUserId
      };

      saveFormSubmissions({ variables })
        .then(() => {
          Alert.success('Risk assessment submitted successfully');
          // refetch();
          // refetchSubmissions();
          // closeModal();
        })
        .catch(err => {
          Alert.error(err.message);
        });
    };

    if (formDetailQuery.loading) {
      return <Spinner objective />;
    }

    const { riskConformityFormDetail } = formDetailQuery;

    const updatedProps = {
      ...riskConformityFormDetail,
      // formId: formDetailQuery.riskConformityFormDetail.formId,
      formSubmissionsSave,
      closeModal,
      isSubmitted
    };

    return <SubmitForm {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.riskConformityFormDetail), {
      name: 'formDetailQuery',
      options: ({ cardId, cardType, currentUserId, riskAssessmentId }) => ({
        variables: { cardId, cardType, userId: currentUserId, riskAssessmentId }
      })
    }),
    graphql<Props>(gql(mutations.riskFormSaveSubmission), {
      name: 'saveFormSubmissions',
      options: () => ({
        refetchQueries: ['formDetailQuery']
      })
    })
  )(Submissions)
);
