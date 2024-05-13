
import React from 'react';
import queries from '../../graphql/queries';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import Section from '../../components/cardRightSidebarSection/Section';
import Spinner from '@erxes/ui/src/components/Spinner';


type Props = {
  mainType: string;
  mainTypeId: string;
};

const Container = (props: Props) => {
  const vendor = useQuery(gql(queries.clientPortalParticipants), {
    variables: {
      contentType: props.mainType,
      contentTypeId: props.mainTypeId,
      userKind: "vendor",
    },
    skip: !props.mainType || !props.mainTypeId,
  });

  const client = useQuery(gql(queries.clientPortalParticipants), {
    variables: {
      contentType: props.mainType,
      contentTypeId: props.mainTypeId,
      userKind: "client",
    },
    skip: !props.mainType || !props.mainTypeId,
  });

  if (vendor.loading || client.loading) {
    return <Spinner />;
  }

  const clientPortalClientParticipants =
    (client && client.data && client.data.clientPortalParticipants) || [];
  const clientPortalVendorParticipants =
    (vendor && vendor.data && vendor.data.clientPortalParticipants) || [];

  return (
    <Section
      {...props}
      refetch={refetch}
      participants={clientPortalParticipants}
      kind='vendor'
    />
  );
};

export default Container;
