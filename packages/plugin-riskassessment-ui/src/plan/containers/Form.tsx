import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import {
  Alert,
  ButtonMutate,
  EmptyState,
  Spinner,
  confirm
} from '@erxes/ui/src';
import {
  IButtonMutateProps,
  IRouterProps,
  QueryResponse
} from '@erxes/ui/src/types';
import { withProps } from '@erxes/ui/src/utils/core';
import * as compose from 'lodash.flowright';
import React from 'react';
import FormComponent from '../components/Form';
import { mutations, queries } from '../graphql';

type Props = {
  _id?: string;
  closeModal: () => void;
};

type FinalProps = {
  planQueryResponse: { riskAssessmentPlan: any } & QueryResponse;
  removeScheduleMutationResponse: any;
  addScheduleMutationResponse: any;
  updateScheduleMutationResponse: any;
} & IRouterProps &
  Props;

class Form extends React.Component<FinalProps> {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      planQueryResponse,
      removeScheduleMutationResponse,
      closeModal,
      history
    } = this.props;

    if (planQueryResponse?.loading) {
      return <Spinner />;
    }

    if (planQueryResponse?.error) {
      return (
        <EmptyState
          text="Something went wrong"
          image="/images/actions/24.svg"
        />
      );
    }

    const renderButton = ({
      name,
      values,
      isSubmitted,
      callback,
      confirmationUpdate,
      object
    }: IButtonMutateProps) => {
      const afterMutate = data => {
        callback && callback();
        if (!object && data?.addRiskAssessmentPlan) {
          const newData = data?.addRiskAssessmentPlan;
          history.push(`/settings/risk-assessment-plans/edit/${newData._id}`);
        }
      };

      let mutation = mutations.addPlan;
      let successAction = 'added';
      if (object) {
        mutation = mutations.updatePlan;
        successAction = 'updated';
      }
      return (
        <ButtonMutate
          mutation={mutation}
          variables={values}
          callback={afterMutate}
          isSubmitted={isSubmitted}
          type="submit"
          confirmationUpdate={confirmationUpdate}
          successMessage={`You successfully ${successAction} a ${name}`}
        />
      );
    };

    const removeSchedule = id => {
      confirm().then(() => {
        removeScheduleMutationResponse({ variables: { id } })
          .then(() => {
            planQueryResponse.refetch();
            Alert.success('Removed schedule successfully');
          })
          .catch(err => {
            Alert.error(err.message);
          });
      });
    };

    const updatedProps = {
      ...this.props,
      detail: planQueryResponse?.riskAssessmentPlan,
      refetch: planQueryResponse?.refetch,
      renderButton,
      closeModal,
      removeSchedule
    };

    return <FormComponent {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, { riskAssessmentPlan: any } & QueryResponse>(
      gql(queries.plan),
      {
        name: 'planQueryResponse',
        skip: ({ _id }) => !_id,
        options: ({ _id }) => ({
          variables: { _id },
          fetchPolicy: 'no-cache'
        })
      }
    ),
    graphql<Props>(gql(mutations.removeSchedule), {
      name: 'removeScheduleMutationResponse'
    })
  )(Form)
);
