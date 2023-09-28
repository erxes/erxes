import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { graphql } from '@apollo/client/react/hoc';
import { Alert, withProps } from '@erxes/ui/src/utils';
import {
  PayDatesQueryResponse,
  ScheduleConfigOrderQueryResponse,
  ScheduleConfigQueryResponse,
  ScheduleMutationResponse
} from '../../types';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import withCurrentUser from '@erxes/ui/src/auth/containers/withCurrentUser';
import { IUser } from '@erxes/ui/src/auth/types';
import { mutations, queries } from '../../graphql';
import ScheduleForm from '../../components/schedule/ScheduleForm';
import { IBranch, IDepartment } from '@erxes/ui/src/team/types';

type Props = {
  currentUser: IUser;
  isCurrentUserAdmin: boolean;

  branches: IBranch[];
  departments: IDepartment[];

  scheduleOfMember?: any;
  queryParams: any;
  history: any;
  modalContentType: string;

  checkDuplicateScheduleShifts: (values: any) => any;

  closeModal: any;
};

type FinalProps = {
  listScheduleConfigsQuery: ScheduleConfigQueryResponse;
  scheduleConfigOrderQuery: ScheduleConfigOrderQueryResponse;
} & Props &
  ScheduleMutationResponse;

const ScheduleFormContainer = (props: FinalProps) => {
  const {
    listScheduleConfigsQuery,
    scheduleConfigOrderQuery,
    scheduleConfigOrderEditMutation,
    editScheduleMutation
  } = props;

  if (listScheduleConfigsQuery.loading) {
    return <Spinner />;
  }

  const { scheduleConfigs = [] } = listScheduleConfigsQuery;

  const scheduleConfigOrderEdit = (variables: any) => {
    scheduleConfigOrderEditMutation({ variables })
      .then(() => {
        Alert.success('Successfully saved schedule configs order');
      })
      .catch(err => Alert.error(err.message));
  };

  const editSchedule = (scheduleId: string, shifts: any, closeModal: any) => {
    editScheduleMutation({ variables: { _id: scheduleId, shifts } })
      .then(() => {
        Alert.success('Successfully edited schedule');
        closeModal();
      })
      .catch(err => Alert.error(err.message));
  };

  return (
    <ScheduleForm
      scheduleConfigs={scheduleConfigs}
      {...props}
      scheduleConfigOrder={scheduleConfigOrderQuery.scheduleConfigOrder}
      scheduleConfigOrderEdit={scheduleConfigOrderEdit}
      editSchedule={editSchedule}
    />
  );
};

export default withProps<Props>(
  compose(
    graphql<Props, PayDatesQueryResponse>(gql(queries.scheduleConfigs), {
      name: 'listScheduleConfigsQuery',
      options: () => ({
        fetchPolicy: 'network-only'
      })
    }),
    graphql<Props, ScheduleConfigOrderQueryResponse>(
      gql(queries.scheduleConfigOrder),
      {
        name: 'scheduleConfigOrderQuery',
        options: () => ({
          fetchPolicy: 'network-only'
        })
      }
    ),

    graphql<Props, ScheduleMutationResponse>(
      gql(mutations.scheduleConfigOrderEdit),
      {
        name: 'scheduleConfigOrderEditMutation',
        options: () => ({
          refetchQueries: ['scheduleConfigOrder']
        })
      }
    ),

    graphql<Props, ScheduleMutationResponse>(gql(mutations.editSchedule), {
      name: 'editScheduleMutation',
      options: () => ({
        refetchQueries: ['schedulesMain']
      })
    })
  )(withCurrentUser(ScheduleFormContainer))
);
