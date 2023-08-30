import React from 'react';
import { useQuery, gql } from '@apollo/client';
import { queries } from '../../graphql';
import { Spinner } from '@erxes/ui/src/components';
import { ListComponent } from '../../components/myMeetings/List';

type Props = {
  history: any;
};

export const MyMeetingListContainer = (props: Props) => {
  const { data, loading } = useQuery(gql(queries.meetings), {
    variables: { status: 'completed' }
  });

  if (loading) {
    return <Spinner />;
  }

  const updatedProps = {
    ...props,
    meetings: data.meetings
  };
  return <ListComponent {...updatedProps} />;
};
