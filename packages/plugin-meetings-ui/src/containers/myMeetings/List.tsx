import React from 'react';
import { useQuery, gql } from '@apollo/client';
import { queries } from '../../graphql';
import { Spinner } from '@erxes/ui/src/components';
import { ListComponent } from '../../components/myMeetings/List';

type Props = {
  history: any;
  queryParams: any;
};

export const MyMeetingListContainer = (props: Props) => {
  const { queryParams } = props;
  const { createdAtFrom, createdAtTo, ownerId, companyId } = queryParams;

  const { data, loading } = useQuery(gql(queries.meetings), {
    variables: { createdAtFrom, createdAtTo, userId: ownerId, companyId }
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
