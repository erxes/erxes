import Spinner from '@erxes/ui/src/components/Spinner';
import gql from 'graphql-tag';
import React from 'react';
import { useQuery } from 'react-apollo';

import BuildingsSection from '../../components/detail/sections/BuildingsSection';
import { queries } from '../../graphql';

type Props = {
  title: string;
  ticketId: string;
};

const Container = (props: Props) => {
  const { ticketId } = props;

  const { data, loading } = useQuery(gql(queries.buildingsQuery), {
    variables: { customQuery: { installationRequestIds: ticketId } },
    fetchPolicy: 'network-only'
  });

  if (loading) {
    return <Spinner />;
  }

  const buildings = data.buildings || [];

  return <BuildingsSection {...props} buildings={buildings} />;
};

export default Container;
