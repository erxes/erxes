import React from 'react';
import gql from 'graphql-tag';
import { useQuery } from 'react-apollo';

import { queries } from '../../graphql';
import StructureBox from '../../components/structure/Box';

import Box from 'modules/common/components/Box';
import Spinner from 'modules/common/components/Spinner';
import ErrorMsg from 'modules/common/components/ErrorMsg';
import { __ } from 'modules/common/utils';
import { ErrorContainer } from '../../styles';

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
      <Box isOpen={true} title={__('Structure')} name="showStructure">
        <ErrorContainer>
          <ErrorMsg>{error.message}</ErrorMsg>
        </ErrorContainer>
      </Box>
    );
  }

  return <StructureBox refetch={refetch} structure={data.structureDetail} />;
}
