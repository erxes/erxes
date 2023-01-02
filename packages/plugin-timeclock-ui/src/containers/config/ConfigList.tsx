import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { graphql } from 'react-apollo';
import { withProps } from '@erxes/ui/src/utils/core';
import React from 'react';
import ConfigList from '../../components/config/ConfigList';
import {
  AbsenceMutationResponse,
  AbsenceTypeQueryResponse,
  ConfigMutationResponse,
  PayDatesQueryResponse,
  HolidaysQueryResponse
} from '../../types';
import { mutations, queries } from '../../graphql';
import { Alert, confirm } from '@erxes/ui/src/utils';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IButtonMutateProps } from '@erxes/ui/src/types';

type Props = {
  getActionBar: (actionBar: any) => void;
  history: any;
  queryParams: any;
  absenceTypeId?: string;
  absenceName?: string;
  attachment?: boolean;
  explanation?: boolean;
  userId?: string;
  reason?: string;
  startTime?: Date;
  endTime?: Date;
  absenceId?: string;
  absenceStatus?: string;
  payDates?: number[];
};

type FinalProps = {
  listAbsenceTypesQuery: AbsenceTypeQueryResponse;
  listPayDatesQuery: PayDatesQueryResponse;
  listHolidaysQuery: HolidaysQueryResponse;
} & Props &
  ConfigMutationResponse;

const ListContainer = (props: FinalProps) => {
  const {
    removeAbsenceTypeMutation,
    removePayDateMutation,
    removeHolidayMutation,
    listAbsenceTypesQuery,
    listPayDatesQuery,
    listHolidaysQuery
  } = props;

  const renderButton = ({
    values,
    isSubmitted,
    callback,
    object,
    name
  }: IButtonMutateProps) => {
    let mutation;
    if (name === 'absenceType') {
      mutation = object ? mutations.absenceTypeEdit : mutations.absenceTypeAdd;
    }

    if (name === 'holiday') {
      mutation = object ? mutations.holidayEdit : mutations.holidayAdd;
    }

    if (name === 'payDate') {
      mutation = object ? mutations.payDateEdit : mutations.payDateAdd;
    }

    return (
      <ButtonMutate
        mutation={mutation}
        variables={values}
        callback={callback}
        refetchQueries={[
          {
            query: gql(queries.listAbsenceTypes)
          },
          {
            query: gql(queries.listHolidays)
          },
          {
            query: gql(queries.listPayDates)
          }
        ]}
        isSubmitted={isSubmitted}
        btnStyle="primary"
        type="submit"
        successMessage={`You successfully ${
          object ? 'updated' : 'added'
        } ${name}`}
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

  const removeHoliday = (_id: string) => {
    confirm('Are you sure to remove this holiday').then(() => {
      removeHolidayMutation({ variables: { _id: `${_id}` } })
        .then(() => Alert.success('Successfully removed holiday'))
        .catch(err => {
          throw new Error(err);
        });
    });
  };

  const removePayDate = (_id: string) => {
    confirm('Are you sure to remove this holiday').then(() => {
      removePayDateMutation({ variables: { _id: `${_id}` } })
        .then(() => Alert.success('Successfully removed payDate'))
        .catch(err => {
          throw new Error(err);
        });
    });
  };

  const updatedProps = {
    ...props,
    holidays: listHolidaysQuery.holidays,
    absenceTypes: listAbsenceTypesQuery.absenceTypes,
    payDates: listPayDatesQuery.payDates || [],
    removeAbsenceType,
    removeHoliday,
    removePayDate,
    renderButton
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
    graphql<Props, PayDatesQueryResponse>(gql(queries.listHolidays), {
      name: 'listHolidaysQuery',
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

    graphql<Props, ConfigMutationResponse>(gql(mutations.holidayRemove), {
      name: 'removeHolidayMutation',
      options: ({ payDates }) => ({
        variables: {
          dateNums: payDates
        },
        refetchQueries: ['holidays']
      })
    }),

    graphql<Props, ConfigMutationResponse>(gql(mutations.payDateRemove), {
      name: 'removePayDateMutation',
      options: ({ payDates }) => ({
        variables: {
          dateNums: payDates
        },
        refetchQueries: ['payDates']
      })
    })
  )(ListContainer)
);
