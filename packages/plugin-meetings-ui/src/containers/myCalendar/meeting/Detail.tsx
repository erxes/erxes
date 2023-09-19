import { gql, useMutation, useQuery } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { graphql } from '@apollo/client/react/hoc';
import { Alert, withProps } from '@erxes/ui/src/utils';
import { MeetingDetailQueryResponse } from '../../../types';
import { mutations, queries } from '../../../graphql';
import { queries as dealsQuery } from '@erxes/ui-cards/src/deals/graphql';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import { MeetingDetail } from '../../../components/myCalendar/meeting/Detail';
import { confirm } from '@erxes/ui/src/utils';
import { isEnabled } from '@erxes/ui/src/utils/core';

type Props = {
  queryParams: any;
  meetingId?: string;
  status?: string;
  companyId?: string;
  dealIds?: string[];
};

type FinalProps = {
  meetingDetailQuery: MeetingDetailQueryResponse;
} & Props;

const MeetingDetailContainer = (props: FinalProps) => {
  const { meetingDetailQuery, companyId, status, dealIds } = props;

  const { data, loading } = useQuery(gql(queries.meetings), {
    variables: { companyId, status, perPage: 50 },
    skip: !companyId
  });

  const { data: deals, loading: dealsLoading } = useQuery(
    gql(dealsQuery.deals),
    {
      skip: (!dealIds || dealIds.length === 0) && !isEnabled('cards'),
      variables: { _ids: dealIds }
    }
  );

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

  if (
    (meetingDetailQuery && meetingDetailQuery.loading) ||
    loading ||
    dealsLoading
  ) {
    return <Spinner />;
  }
  const reduceDeals = deals?.deals.map(deal => ({
    _id: deal._id,
    name: deal.name
  }));
  const updatedProps = {
    meetingDetail: meetingDetailQuery && meetingDetailQuery.meetingDetail,
    changeStatus,
    meetings: data?.meetings,
    deals: reduceDeals
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
