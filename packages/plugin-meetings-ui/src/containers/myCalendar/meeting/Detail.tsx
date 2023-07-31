import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { graphql } from '@apollo/client/react/hoc';
import { withProps } from '@erxes/ui/src/utils';
import {
  EditTypeMutationResponse,
  RemoveTypeMutationResponse,
  MeetingsQueryResponse,
  MeetingDetailQueryResponse
} from '../../../types';
import { queries } from '../../../graphql';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import { MeetingDetail } from '../../../components/myCalendar/meeting/Detail';

type Props = {
  queryParams: any;
  meetingId: string;
};

type FinalProps = {
  meetingDetailQuery: MeetingDetailQueryResponse;
} & Props &
  RemoveTypeMutationResponse &
  EditTypeMutationResponse;

const MeetingDetailContainer = (props: FinalProps) => {
  const { meetingDetailQuery, meetingId } = props;

  if (meetingDetailQuery.loading) {
    return <Spinner />;
  }

  const updatedProps = {
    meetingDetail: meetingDetailQuery.meetingDetail
  };

  return <MeetingDetail {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql(gql(queries.meetingDetail), {
      name: 'meetingDetailQuery',
      options: (props: Props) => ({
        variables: {
          _id: props.meetingId
        }
      })
    })
  )(MeetingDetailContainer)
);
