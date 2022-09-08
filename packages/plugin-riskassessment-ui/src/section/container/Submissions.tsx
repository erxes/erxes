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
  closeModal: () => void;
  currentUserId?: string;
  refetch: () => void;
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
      closeModal,
      currentUserId,
      refetch
    } = this.props;

    const formSubmissionsSave = doc => {
      const variables = {
        ...doc,
        contentTypeId: cardId,
        contentType: 'form',
        userId: currentUserId
      };

      saveFormSubmissions({ variables })
        .then(() => {
          Alert.success('Risk assessment submitted successfully');
          refetch();
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
      closeModal
    };

    return <SubmissionsComponent {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.riskConfirmityDetail), {
      name: 'formDetail',
      options: ({ cardId, currentUserId }) => ({
        variables: { cardId, userId: currentUserId }
      })
    }),
    graphql<Props>(gql(mutations.formSubmissionsSave), {
      name: 'saveFormSubmissions',
      options: () => ({
        refetchQueries: ['formDetail']
      })
    })
  )(Submissions)
);
