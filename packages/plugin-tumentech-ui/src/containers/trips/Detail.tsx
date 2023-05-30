import EmptyState from '@erxes/ui/src/components/EmptyState';
import Spinner from '@erxes/ui/src/components/Spinner';
import { gql, useQuery } from '@apollo/client';
import React from 'react';

import TripDetail from '../../components/trips/Detail';
import queries from '../../graphql/queries';

type Props = {
  id: string;
};

const TripDetailContainer = (props: Props) => {
  const { id } = props;

  const tripsQuery = useQuery(gql(queries.tripDetail), {
    variables: {
      _id: id
    },
    fetchPolicy: 'network-only'
  });

  const fieldGroupsQuery = useQuery(gql(queries.fieldsGroups), {
    variables: {
      contentType: 'cards:deal'
    },
    fetchPolicy: 'network-only'
  });

  if (fieldGroupsQuery.loading || tripsQuery.loading) {
    return <Spinner objective={true} />;
  }

  if (!tripsQuery.data.tripDetail) {
    return <EmptyState text="Trip not found" image="/images/actions/17.svg" />;
  }

  const updatedProps = {
    ...props,
    trip: tripsQuery.data.tripDetail || ({} as any),
    fields: []
  };

  return <TripDetail {...updatedProps} />;
};

export default TripDetailContainer;
