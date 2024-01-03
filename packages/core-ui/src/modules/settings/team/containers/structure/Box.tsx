import React from 'react';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client';

import { queries } from '@erxes/ui/src/team/graphql';
import StructureBox from '../../components/structure/Box';

import Spinner from '@erxes/ui/src/components/Spinner';
import ErrorMsg from '@erxes/ui/src/components/ErrorMsg';
import { __ } from 'modules/common/utils';
import { MenuFooter } from 'modules/settings/styles';

export default function BoxContainer() {
  const { data, loading, error, refetch } = useQuery(
    gql(queries.structureDetail),
    {
      fetchPolicy: 'network-only'
    }
  );

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return (
      <MenuFooter>
        <ErrorMsg>{error.message}</ErrorMsg>
      </MenuFooter>
    );
  }

  return <StructureBox refetch={refetch} structure={data.structureDetail} />;
}
