import { gql, useMutation, useQuery } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { graphql } from '@apollo/client/react/hoc';
import { Alert, withProps } from '@erxes/ui/src/utils';
import { MeetingDetailQueryResponse } from '../../../types';
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
} & Props;

const MeetingDetailContainer = (props: FinalProps) => {
  const { meetingDetailQuery, companyId, status } = props;

  const { data, loading } = useQuery(gql(queries.meetings), {
    variables: { companyId, status, perPage: 50 },
    skip: !companyId
  });

  const [editMeetingStatus] = useMutation(gql(mutations.editMeetingStatus), {
    refetchQueries: ['meetings'],
    onError: e => {
      Alert.error(e.message);
    }
  });

  const changeStatus = (meetingId: string, status: string) => {
    const confirmLabel =
      status === 'canceled'
        ? 'Cancel meeting?'
        : status === 'draft'
        ? 'Draft meeting?'
        : status === 'ongoing'
        ? 'Start meeting?'
        : 'End meeting?';

    confirm(confirmLabel).then(() =>
      editMeetingStatus({ variables: { _id: meetingId, status } })
    );
  };

  if ((meetingDetailQuery && meetingDetailQuery.loading) || loading) {
    return <Spinner />;
  }
  const updatedProps = {
    meetingDetail: meetingDetailQuery && meetingDetailQuery.meetingDetail,
    changeStatus,
    meetings: data?.meetings
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
