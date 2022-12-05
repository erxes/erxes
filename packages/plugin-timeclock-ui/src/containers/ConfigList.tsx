import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { graphql } from 'react-apollo';
import { withProps } from '@erxes/ui/src/utils/core';
import React from 'react';
import ConfigList from '../components/ConfigList';
import {
  AbsenceMutationResponse,
  AbsenceQueryResponse,
  AbsenceTypeQueryResponse,
  ConfigMutationResponse
} from '../types';
import { mutations, queries } from '../graphql';
import Spinner from '@erxes/ui/src/components/Spinner';
import { Alert } from '@erxes/ui/src/utils';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IButtonMutateProps } from '@erxes/ui/src/types';

type Props = {
  history: any;
  queryParams: any;
  absenceTypeId: string;
  absenceName: string;
  attachment: boolean;
  explanation: boolean;
  userId: string;
  reason: string;
  startTime: Date;
  endTime: Date;
  absenceId: string;
  absenceStatus: string;

  queryStartDate: Date;
  queryEndDate: Date;
  queryUserId: string;
};

type FinalProps = {
  listAbsenceTypeQuery: AbsenceTypeQueryResponse;
} & Props &
  ConfigMutationResponse;

const ListContainer = (props: FinalProps) => {
  const {
    queryParams,
    submitAbsenceConfigMutation,
    submitScheduleConfigMutation,
    listAbsenceTypeQuery
  } = props;
  const { startDate, endDate, userId, reason } = queryParams;

  // if (listAbsenceQuery.loading) {
  //   return <Spinner />;
  // }

  // const solveAbsence = (absenceId: string, status: string) => {
  //   solveAbsenceMutation({
  //     variables: { _id: absenceId, status: `${status}` }
  //   })
  //     .then(() => Alert.success('Successfully solved absence request'))
  //     .catch(err => Alert.error(err.message));
  // };

  // const submitRequest = (expl: string) => {
  //   sendAbsenceReqMutation({
  //     variables: {
  //       startTime: startDate,
  //       endTime: endDate,
  //       userId: `${userId}`,
  //       reason: `${reason}`,
  //       explanation: expl
  //     }
  //   })
  //     .then(() => Alert.success('Successfully sent an absence request'))
  //     .catch(err => Alert.error(err.message));
  // };

  const submitAbsenceConfig = ({
    values,
    object,
    isSubmitted
  }: IButtonMutateProps) => {
    return (
      <ButtonMutate
        mutation={object ? mutations.absenceTypeEdit : mutations.absenceTypeAdd}
        variables={values}
        type="submit"
        isSubmitted={isSubmitted}
        successMessage={`You successfully ${
          object ? 'updated' : 'added'
        } absence type`}
      />
    );
  };

  // const submitAbsenceConfig = (
  //   name: string,
  //   explanation: boolean,
  //   attachment: boolean,
  //   _id?: string
  // ) => {
  //   submitAbsenceConfigMutation({
  //     variables: {
  //       _id: `${_id}`,
  //       name: `${name}`,
  //       explRequired: explanation,
  //       attachRequired: attachment
  //     }
  //   }).then(() => Alert.success('Successfully added an absence type'));
  // };

  const updatedProps = {
    ...props,
    absenceTypes: listAbsenceTypeQuery.absenceTypes,
    submitAbsenceConfig
  };
  return <ConfigList {...updatedProps} />;
};
export default withProps<Props>(
  compose(
    graphql<Props, AbsenceTypeQueryResponse>(gql(queries.listAbsenceTypes), {
      name: 'listAbsenceTypeQuery',
      options: () => ({
        fetchPolicy: 'network-only'
      })
    })
    // graphql<Props, AbsenceMutationResponse>(gql(mutations.absenceTypeAdd), {
    //   name: 'submitAbsenceConfigMutation',
    //   options: ({ absenceName, explanation, attachment }) => ({
    //     variables: {
    //       name: absenceName,
    //       explRequired: explanation,
    //       attachRequired: attachment
    //     },
    //     refetchQueries: ['absenceTypes']
    //   })
    // })
    // graphql<Props, AbsenceMutationResponse>(gql(mutations.absenceTypeEdit), {
    //   name: 'submitAbsenceConfigMutation',
    //   options: ({ absenceTypeId, absenceName, explanation, attachment }) => ({
    //     variables: {
    //       _id: absenceTypeId,
    //       name: absenceName,
    //       explRequired: explanation,
    //       attachRequired: attachment
    //     },
    //     refetchQueries: ['listAbsenceQuery']
    //   })
    // })
  )(ListContainer)
);
