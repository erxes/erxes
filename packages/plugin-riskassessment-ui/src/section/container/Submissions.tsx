import { Alert, Spinner } from '@erxes/ui/src';
import { withProps } from '@erxes/ui/src/utils/core';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';
import { IRiskFormDetailQueryResponse } from '../../common/types';
import SubmissionsComponent from '../component/Submissions';
import { mutations, queries } from '../graphql';
type Props = {
  cardId: string;
  cardType:string
  closeModal: () => void;
  currentUserId?: string;
  refetch: () => void;
  refetchSubmissions: () => void;
  riskAssessmentId?: string;
  isSubmitted?: boolean;
};

type FinalProps = {
  formDetail: IRiskFormDetailQueryResponse;
  saveFormSubmissions: any;
} & Props;

class Submissions extends React.Component<FinalProps> {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      formDetail,
      saveFormSubmissions,
      cardId,
      cardType,
      closeModal,
      currentUserId,
      refetch,
      refetchSubmissions,
      riskAssessmentId,
      isSubmitted
    } = this.props;

    const formSubmissionsSave = doc => {
      const variables = {
        ...doc,
        cardId,
        cardType,
        userId: currentUserId,
        riskAssessmentId
      };

      saveFormSubmissions({ variables })
        .then(() => {
          Alert.success('Risk assessment submitted successfully');
          refetch();
          refetchSubmissions();
          closeModal();
        })
        .catch(err => {
          Alert.error(err.message);
        });
    };

    if (formDetail.loading) {
      return <Spinner objective />;
    }

    const updatedProps = {
      fields: formDetail.riskConfirmityFormDetail.fields,
      submissions: formDetail.riskConfirmityFormDetail.submissions,
      formId: formDetail.riskConfirmityFormDetail.formId,
      formSubmissionsSave,
      closeModal,
      isSubmitted
    };

    return <SubmissionsComponent {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.riskConfirmityDetail), {
      name: 'formDetail',
      options: ({ cardId,cardType, currentUserId, riskAssessmentId }) => ({
        variables: { cardId,cardType , userId: currentUserId, riskAssessmentId }
      })
    }),
    graphql<Props>(gql(mutations.riskFormSaveSubmission), {
      name: 'saveFormSubmissions',
      options: () => ({
        refetchQueries: ['formDetail']
      })
    })
  )(Submissions)
);
