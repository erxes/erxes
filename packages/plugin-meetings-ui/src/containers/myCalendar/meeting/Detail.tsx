import { gql, useMutation, useQuery } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { graphql } from '@apollo/client/react/hoc';
import { withProps } from '@erxes/ui/src/utils';
import {
  EditTypeMutationResponse,
  RemoveTypeMutationResponse,
  MeetingDetailQueryResponse
} from '../../../types';
import { mutations, queries } from '../../../graphql';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import { MeetingDetail } from '../../../components/myCalendar/meeting/Detail';
import { confirm } from '@erxes/ui/src/utils';

type Props = {
  queryParams: any;
  meetingId?: string;
  status?: string;
  companyId?: string;
};

type FinalProps = {
  meetingDetailQuery: MeetingDetailQueryResponse;
} & Props &
  RemoveTypeMutationResponse &
  EditTypeMutationResponse;

const MeetingDetailContainer = (props: FinalProps) => {
  const { meetingDetailQuery, companyId, status } = props;

  const { data, loading } = useQuery(gql(queries.meetings), {
    variables: { companyId, status },
    skip: !companyId
  });

  const [editMeetingStatus] = useMutation(gql(mutations.editMeetingStatus), {
    refetchQueries: ['meetingQuery'],
    onError: e => {
      console.error(e);
    }
  });

  const changeStatus = (meetingId: string, status: string) => {
    confirm('Start meeting?').then(() =>
      editMeetingStatus({ variables: { _id: meetingId, status } })
    );
  };

  if ((meetingDetailQuery && meetingDetailQuery.loading) || loading) {
    return <Spinner />;
  }

  const updatedProps = {
    meetingDetail: meetingDetailQuery && meetingDetailQuery.meetingDetail,
    changeStatus,
    meetings: data?.meetings,
    refetchDetail: meetingDetailQuery && meetingDetailQuery.refetch
  };

  return <MeetingDetail {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql(gql(queries.meetingDetail), {
      name: 'meetingDetailQuery',
      options: (props: Props) => ({
        variables: {
          _id: props.meetingId,
          status: props.status && props.status
        }
      })
    })
  )(MeetingDetailContainer)
);
