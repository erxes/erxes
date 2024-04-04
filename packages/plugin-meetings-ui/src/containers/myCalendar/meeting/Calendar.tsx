import { IUser } from '@erxes/ui/src/auth/types';
import React from 'react';
import CalendarComponent from '../../../components/myCalendar/meeting/Calendar';
import { IMeeting } from '../../../types';
import { gql, useMutation } from '@apollo/client';
import { mutations } from '../../../graphql';
import { Alert, confirm } from '@erxes/ui/src/utils';

type Props = {
  meetings?: IMeeting[];
  queryParams: any;
  currentUser: IUser;
};
export const CalendarContainer = (props: Props) => {
  const [changeMeetingDate] = useMutation(gql(mutations.editMeeting), {
    refetchQueries: ['meetings']
  });
  const changeDateMeeting = (
    meetingId: string,
    start: string,
    end: string,
    callback: () => void // Specify the callback type
  ) => {
    changeMeetingDate({
      variables: {
        _id: meetingId,
        startDate: new Date(start),
        endDate: new Date(end)
      }
    })
      .then(res => {
        Alert.success('You successfully edited a meeting');
      })
      .catch(e => {
        Alert.error(e.message);
        callback(); // Call the callback on error
      });
  };

  const updatedProps = {
    ...props,
    changeDateMeeting
  };
  return <CalendarComponent {...updatedProps} />;
};
