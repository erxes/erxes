import React from 'react';
import queries from '../../graphql/queries';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import VendorSection from '../../components/cardRightSidebarSection/VendorSection';
import Spinner from '@erxes/ui/src/components/Spinner';

type Props = {
  mainType: string;
  mainTypeId: string;
};

const Container = (props: Props) => {
  const {
    loading,
    data = {},
    refetch,
  } = useQuery(gql(queries.clientPortalParticipants), {
    variables: {
      contentType: props.mainType,
      contentTypeId: props.mainTypeId,
      userKind: 'client',
    },
    skip: !props.mainType || !props.mainTypeId,
  });

  if (loading) {
    return <Spinner />;
  }

  const { clientPortalParticipants = [] } = data;

  return (
    <VendorSection
      {...props}
      refetch={refetch}
      participants={clientPortalParticipants}
      kind="client"
    />
  );
};

export default Container;
