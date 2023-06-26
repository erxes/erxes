import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { graphql } from '@apollo/client/react/hoc';
import { withProps } from '@erxes/ui/src/utils/core';
import React from 'react';
import ConfigList from '../../components/config/ConfigList';
import {
  AbsenceMutationResponse,
  AbsenceTypeQueryResponse,
  ConfigMutationResponse,
  PayDatesQueryResponse,
  HolidaysQueryResponse,
  ScheduleConfigQueryResponse
} from '../../types';
import { mutations, queries } from '../../graphql';
import { Alert, confirm } from '@erxes/ui/src/utils';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IButtonMutateProps } from '@erxes/ui/src/types';

type Props = {
  getActionBar: (actionBar: any) => void;
  showSideBar: (sideBar: boolean) => void;
  getPagination: (pagination: any) => void;

  history: any;
  queryParams: any;

  absenceTypeId?: string;
  absenceName?: string;

  attachment?: boolean;
  explanation?: boolean;
  reason?: string;
  userId?: string;

  startTime?: Date;
  endTime?: Date;

  absenceId?: string;
  absenceStatus?: string;

  payDates?: number[];
  scheduleConfigId?: string;
  deviceConfigId?: string;
};

type FinalProps = {
  listAbsenceTypesQuery: AbsenceTypeQueryResponse;
  listPayDatesQuery: PayDatesQueryResponse;
  listHolidaysQuery: HolidaysQueryResponse;
  listScheduleConfigsQuery: ScheduleConfigQueryResponse;
} & Props &
  ConfigMutationResponse;

const ListContainer = (props: FinalProps) => {
  const {
    removeAbsenceTypeMutation,
    removePayDateMutation,
    removeHolidayMutation,
    removeScheduleConfigMutation,
    removeDeviceConfigMutation,
    listAbsenceTypesQuery,
    listPayDatesQuery,
    listHolidaysQuery,
    listScheduleConfigsQuery
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

    if (name === 'schedule') {
      mutation = object
        ? mutations.scheduleConfigEdit
        : mutations.scheduleConfigAdd;
    }

    return (
      <ButtonMutate
        mutation={mutation}
        variables={values}
        callback={callback}
        refetchQueries={[
          {
            query: gql(queries.absenceTypes)
          },
          {
            query: gql(queries.holidays)
          },
          {
            query: gql(queries.payDates)
          },
          {
            query: gql(queries.scheduleConfigs)
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
          Alert.error(err);
        });
    });
  };

  const removeHoliday = (_id: string) => {
    confirm('Are you sure to remove this holiday').then(() => {
      removeHolidayMutation({ variables: { _id: `${_id}` } })
        .then(() => Alert.success('Successfully removed holiday'))
        .catch(err => {
          Alert.error(err);
        });
    });
  };

  const removePayDate = (_id: string) => {
    confirm('Are you sure to remove this holiday').then(() => {
      removePayDateMutation({ variables: { _id: `${_id}` } })
        .then(() => Alert.success('Successfully removed payDate'))
        .catch(err => {
          Alert.error(err);
        });
    });
  };

  const removeScheduleConfig = (_id: string) => {
    confirm('Are you sure to remove this schedule config').then(() => {
      removeScheduleConfigMutation({ variables: { _id: `${_id}` } })
        .then(() => Alert.success('Successfully removed schedule config'))
        .catch(err => {
          Alert.error(err);
        });
    });
  };

  const removeDeviceConfig = (_id: string) => {
    confirm('Are you sure to remove this device config').then(() => {
      removeDeviceConfigMutation({ variables: { _id: `${_id}` } })
        .then(() => Alert.success('Successfully removed schedule config'))
        .catch(err => {
          Alert.error(err);
        });
    });
  };

  const updatedProps = {
    ...props,
    scheduleConfigs: listScheduleConfigsQuery.scheduleConfigs,
    holidays: listHolidaysQuery.holidays,
    absenceTypes: listAbsenceTypesQuery.absenceTypes || [],
    payDates: listPayDatesQuery.payDates || [],
    removeAbsenceType,
    removeHoliday,
    removePayDate,
    removeScheduleConfig,
    renderButton,
    removeDeviceConfig
  };

  return <ConfigList {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, AbsenceTypeQueryResponse>(gql(queries.absenceTypes), {
      name: 'listAbsenceTypesQuery',
      options: () => ({
        fetchPolicy: 'network-only'
      })
    }),
    graphql<Props, PayDatesQueryResponse>(gql(queries.payDates), {
      name: 'listPayDatesQuery',
      options: () => ({
        fetchPolicy: 'network-only'
      })
    }),
    graphql<Props, PayDatesQueryResponse>(gql(queries.holidays), {
      name: 'listHolidaysQuery',
      options: () => ({
        fetchPolicy: 'network-only'
      })
    }),
    graphql<Props, PayDatesQueryResponse>(gql(queries.scheduleConfigs), {
      name: 'listScheduleConfigsQuery',
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
    }),

    graphql<Props, ConfigMutationResponse>(
      gql(mutations.scheduleConfigRemove),
      {
        name: 'removeScheduleConfigMutation',
        options: ({ scheduleConfigId }) => ({
          variables: {
            _id: scheduleConfigId
          },
          refetchQueries: ['scheduleConfigs']
        })
      }
    )
  )(ListContainer)
);
