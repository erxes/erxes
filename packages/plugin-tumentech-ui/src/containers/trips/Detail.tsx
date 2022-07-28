import EmptyState from '@erxes/ui/src/components/EmptyState';
import Spinner from '@erxes/ui/src/components/Spinner';
import gql from 'graphql-tag';
import React from 'react';
import { useQuery } from 'react-apollo';

import TripDetail from '../../components/trips/Detail';
import queries from '../../graphql/queries';

type Props = {
  id: string;
};

const TripDetailContainer = (props: Props) => {
  const { id } = props;

  const { data, loading } = useQuery(gql(queries.tripDetail), {
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

  if (loading || fieldGroupsQuery.loading) {
    return <Spinner objective={true} />;
  }

  if (!data.tripDetail) {
    return <EmptyState text="Trip not found" image="/images/actions/17.svg" />;
  }

  const updatedProps = {
    ...props,
    trip: data.tripDetail || ({} as any),
    fields: []
  };

  return <TripDetail {...updatedProps} />;
};

export default TripDetailContainer;
