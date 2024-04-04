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
import { ScheduleQueryResponse } from '../common/types';
import FormComponent from '../components/Form';
import { mutations, queries } from '../graphql';

type Props = {
  _id?: string;
};

type FinalProps = {
  planQueryResponse: { riskAssessmentPlan: any } & QueryResponse;
  removeScheduleMutationResponse: any;
  schedulesQueryResponse: ScheduleQueryResponse;
  forceStartPlanMutationResponse: any;
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
      forceStartPlanMutationResponse,
      schedulesQueryResponse,
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

    const removeSchedule = id => {
      confirm().then(() => {
        removeScheduleMutationResponse({ variables: { id } })
          .then(() => {
            Alert.success('Removed schedule successfully');
          })
          .catch(err => {
            Alert.error(err.message);
          });
      });
    };

    const forceStart = id => {
      confirm().then(() => {
        forceStartPlanMutationResponse({ variables: { id } })
          .then(() => {
            Alert.success('Plan started forcefully successfully');
          })
          .catch(err => {
            Alert.error(err.message);
          });
      });
    };

    const renderButton = ({
      text,
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
          successMessage={`You successfully ${successAction} a ${text}`}
        />
      );
    };

    const updatedProps = {
      ...this.props,
      plan: planQueryResponse?.riskAssessmentPlan,
      refetch: planQueryResponse?.refetch,
      renderButton,
      forceStart,
      schedule: {
        removeSchedule,
        refetch: schedulesQueryResponse?.refetch,
        list: schedulesQueryResponse?.riskAssessmentSchedules || []
      }
    };

    return <FormComponent {...updatedProps} />;
  }
}

export const schdulesRefetchQueries = variables => [
  {
    query: gql(queries.schedules),
    variables: { ...variables }
  }
];

export default withProps<Props>(
  compose(
    graphql<Props, { riskAssessmentPlan: any } & QueryResponse>(
      gql(queries.plan),
      {
        name: 'planQueryResponse',
        skip: ({ _id }) => !_id,
        options: ({ _id }) => ({
          variables: { _id }
        })
      }
    ),
    graphql<Props, ScheduleQueryResponse>(gql(queries.schedules), {
      name: 'schedulesQueryResponse',
      skip: ({ _id }) => !_id,
      options: ({ _id }) => ({
        variables: {
          planId: _id
        }
      })
    }),
    graphql<Props>(gql(mutations.removeSchedule), {
      name: 'removeScheduleMutationResponse',
      options: ({ _id }) => ({
        refetchQueries: schdulesRefetchQueries({ planId: _id })
      })
    }),
    graphql<Props>(gql(mutations.forceStartPlan), {
      name: 'forceStartPlanMutationResponse',
      options: ({ _id }) => ({
        refetchQueries: [
          {
            query: gql(queries.plan),
            variables: { _id }
          },
          ...schdulesRefetchQueries({ planId: _id })
        ],
        fetchPolicy: 'no-cache'
      })
    })
  )(Form)
);
