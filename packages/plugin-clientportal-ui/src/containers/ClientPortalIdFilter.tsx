import { Counts } from '@erxes/ui/src/types';
import { gql } from '@apollo/client';
import React from 'react';

import ClientPortalIdFilter from '../components/list/ClientPortalIdFilter';
import { queries } from '../graphql';
import { ClientPortalConfigsQueryResponse } from '../types';
import { useQuery } from '@apollo/client';

type Props = {
  counts: Counts;
  kind?: string;
};

const ClientPortalIdFilterContainer: React.FC<Props> = (props: Props) => {
  const { counts, kind } = props;

  const clientPortalConfigsQuery = useQuery<ClientPortalConfigsQueryResponse>(
    gql(queries.getConfigs),
    {
      fetchPolicy: 'network-only',
      variables: { kind: kind || 'client' },
    },
  );

  const clientPortalGetConfigs =
    (clientPortalConfigsQuery &&
      clientPortalConfigsQuery.data &&
      clientPortalConfigsQuery.data.clientPortalGetConfigs) ||
    [];

  const updatedProps = {
    ...props,
    clientPortalGetConfigs,
    loading:
      (clientPortalConfigsQuery ? clientPortalConfigsQuery.loading : null) ||
      false,
    counts: counts || {},
  };

  return <ClientPortalIdFilter {...updatedProps} />;
};

export default ClientPortalIdFilterContainer;
