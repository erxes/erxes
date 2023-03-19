import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { graphql } from 'react-apollo';
import { Alert, withProps } from '@erxes/ui/src/utils';
import TimeForm from '../../components/timeclock/TimeForm';
import { TimeClockMutationResponse } from '../../types';
import { mutations } from '../../graphql';
import React from 'react';
import { ITimeclock } from '../../types';

type Props = {
  timeclocks: ITimeclock[];
  searchValue: string;
  queryParams: any;
  history: any;
  timeId: string;
  userId: string;
  shiftId: string;
  shiftStarted: boolean;
  longitude: number;
  latitude: number;
  selectedUserId: string;
  closeModal: () => void;
};

type FinalProps = {} & Props & TimeClockMutationResponse;

const ListContainer = (props: FinalProps) => {
  const { timeclocks, startTimeMutation, stopTimeMutation } = props;

  // get current location of an user
  let long = 0;
  let lat = 0;
  navigator.geolocation.getCurrentPosition(position => {
    long = position.coords.longitude;
    lat = position.coords.latitude;
  });

  const startClockTime = (userId: string) => {
    startTimeMutation({
      variables: {
        userId: `${userId}`,
        longitude: long,
        latitude: lat,
        deviceType: 'XOS'
      }
    })
      .then(() => {
        Alert.success('Successfully clocked in');
      })
      .catch(err => Alert.error(err.message));
  };

  const stopClockTime = (userId: string, timeId?: string) => {
    stopTimeMutation({
      variables: {
        _id: timeId,
        userId: `${userId}`,
        longitude: long,
        latitude: lat,
        deviceType: 'XOS'
      }
    })
      .then(() => {
        Alert.success('Successfully clocked out');
      })
      .catch(err => Alert.error(err.message));
  };

  const updatedProps = {
    ...props,
    timeclocks,
    startClockTime,
    stopClockTime
  };
  return <TimeForm {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, TimeClockMutationResponse>(gql(mutations.timeclockStart), {
      name: 'startTimeMutation',
      options: ({ userId, longitude, latitude }) => ({
        variables: {
          userId: `${userId}`,
          longitude: `${longitude}`,
          latitude: `${latitude}`
        },
        refetchQueries: ['timeclocksMain']
      })
    }),

    graphql<Props, TimeClockMutationResponse>(gql(mutations.timeclockStop), {
      name: 'stopTimeMutation',
      options: ({ userId, timeId, longitude, latitude }) => ({
        variables: {
          userId: `${userId}`,
          _id: timeId,
          longitude: `${longitude}`,
          latitude: `${latitude}`
        },
        refetchQueries: ['timeclocksMain']
      })
    })
  )(ListContainer)
);
