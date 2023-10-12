import { gql } from '@apollo/client';
import React from 'react';
import { useQuery } from '@apollo/client';
import Spinner from '@erxes/ui/src/components/Spinner';
import { queries } from '@erxes/ui/src/team/graphql';
import { __ } from 'modules/common/utils';
import Box from '@erxes/ui/src/components/Box';
import ErrorMsg from '@erxes/ui/src/components/ErrorMsg';
import { MenuFooter } from 'modules/settings/styles';
import CommonItem from '../../components/common/CommonItem';

export default function ListContainer() {
  const branchListQuery = useQuery(gql(queries.branches), {
    variables: { withoutUserFilter: true }
  });

  const departmentListQuery = useQuery(gql(queries.departments), {
    variables: { withoutUserFilter: true }
  });

  const unitListQuery = useQuery(gql(queries.units));

  if (
    branchListQuery.loading ||
    departmentListQuery.loading ||
    unitListQuery.loading
  ) {
    return <Spinner />;
  }

  if (branchListQuery.error) {
    return (
      <Box isOpen={true} title={__('Branch')} name="showBranch">
        <MenuFooter>
          <ErrorMsg>{branchListQuery.error.message}</ErrorMsg>
        </MenuFooter>
      </Box>
    );
  }

  if (departmentListQuery.error) {
    return (
      <Box isOpen={true} title={__('Department')} name="showDepartment">
        <MenuFooter>
          <ErrorMsg>{departmentListQuery.error?.message || 'Error'}</ErrorMsg>
        </MenuFooter>
      </Box>
    );
  }

  if (unitListQuery.error) {
    return (
      <Box isOpen={true} title={__('Unit')} name="showUnit">
        <MenuFooter>
          <ErrorMsg>{unitListQuery.error.message}</ErrorMsg>
        </MenuFooter>
      </Box>
    );
  }

  return (
    <CommonItem
      branchListQuery={branchListQuery}
      departmentListQuery={departmentListQuery}
      unitListQuery={unitListQuery}
    />
  );
}
