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
  ConfigMutationResponse,
  PayDatesQueryResponse
} from '../types';
import { mutations, queries } from '../graphql';
import Spinner from '@erxes/ui/src/components/Spinner';
import { Alert, confirm } from '@erxes/ui/src/utils';
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
  payDates: number[];
  queryStartDate: Date;
  queryEndDate: Date;
  queryUserId: string;
};

type FinalProps = {
  listAbsenceTypesQuery: AbsenceTypeQueryResponse;
  listPayDatesQuery: PayDatesQueryResponse;
} & Props &
  ConfigMutationResponse;

const ListContainer = (props: FinalProps) => {
  const {
    queryParams,
    addAbsenceType,
    editAbsenceType,
    removeAbsenceTypeMutation,
    addPayDateMutation,
    editPayDateMutation,
    removePayDateMutation,
    listAbsenceTypesQuery,
    listPayDatesQuery
  } = props;
  const { startDate, endDate, userId, reason } = queryParams;

  const renderButton = ({
    values,
    isSubmitted,
    callback,
    object
  }: IButtonMutateProps) => {
    return (
      <ButtonMutate
        mutation={
          object._id ? mutations.absenceTypeEdit : mutations.absenceTypeAdd
        }
        variables={values}
        callback={callback}
        refetchQueries={[
          {
            query: gql(queries.listAbsenceTypes)
          }
        ]}
        isSubmitted={isSubmitted}
        btnStyle="primary"
        type="submit"
        successMessage={`You successfully ${
          object ? 'updated' : 'added'
        } absence type`}
      />
    );
  };

  const removeAbsenceType = absenceId => {
    confirm('Are you sure to remove this absence type').then(() => {
      removeAbsenceTypeMutation({ variables: { _id: absenceId } })
        .then(() => Alert.success('Successfully removed an absence type'))
        .catch(err => {
          throw new Error(err);
        });
    });
  };

  const submitPayDatesConfig = (payDates: number[]) => {
    confirm('Are you sure to submit these dates as pay dates ? ').then(() => {
      addPayDateMutation({ variables: { dateNums: payDates } })
        .then(() => Alert.success('Successfully submitted pay dates'))
        .catch(err => {
          throw new Error(err);
        });
    });
  };

  console.log(listPayDatesQuery.payDates);

  const updatedProps = {
    ...props,
    absenceTypes: listAbsenceTypesQuery.absenceTypes,
    payDates: listPayDatesQuery.payDates || [],
    removeAbsenceType,
    renderButton,
    submitPayDatesConfig
  };
  return <ConfigList {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, AbsenceTypeQueryResponse>(gql(queries.listAbsenceTypes), {
      name: 'listAbsenceTypesQuery',
      options: () => ({
        fetchPolicy: 'network-only'
      })
    }),
    graphql<Props, PayDatesQueryResponse>(gql(queries.listPayDates), {
      name: 'listPayDatesQuery',
      options: () => ({
        fetchPolicy: 'network-only'
      })
    }),

    graphql<Props, AbsenceMutationResponse>(gql(mutations.absenceTypeRemove), {
      name: 'removeAbsenceTypeMutation',
      options: ({ absenceId }) => ({
        variables: {
          _id: absenceId
        },
        refetchQueries: ['absenceTypes']
      })
    }),

    graphql<Props, AbsenceMutationResponse>(gql(mutations.absenceTypeAdd), {
      name: 'addAbsenceType',
      options: ({ absenceName, explanation, attachment }) => ({
        variables: {
          name: absenceName,
          explRequired: explanation,
          attachRequired: attachment
        },
        refetchQueries: ['absenceTypes']
      })
    }),

    graphql<Props, AbsenceMutationResponse>(gql(mutations.absenceTypeEdit), {
      name: 'editAbsenceType',
      options: ({ absenceId, absenceName, explanation, attachment }) => ({
        variables: {
          _id: absenceId,
          name: absenceName,
          explRequired: explanation,
          attachRequired: attachment
        },
        refetchQueries: ['absenceTypes']
      })
    }),

    graphql<Props, ConfigMutationResponse>(gql(mutations.payDateAdd), {
      name: 'addPayDateMutation',
      options: ({ payDates }) => ({
        variables: {
          dateNums: payDates
        },
        refetchQueries: ['absenceTypes']
      })
    })
  )(ListContainer)
);
