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

  const RenderErrorBox = ({ error, title, name }) => (
    <Box isOpen={true} title={__(title)} name={name}>
      <MenuFooter>
        <ErrorMsg>{error.message}</ErrorMsg>
      </MenuFooter>
    </Box>
  );

  if (branchListQuery.error) {
    return (
      <RenderErrorBox
        error={branchListQuery.error}
        title={'Branch'}
        name="showBranch"
      />
    );
  }

  if (unitListQuery.error) {
    return (
      <RenderErrorBox
        error={unitListQuery.error}
        title={'Unit'}
        name="showUnit"
      />
    );
  }

  if (departmentListQuery.error) {
    return (
      <RenderErrorBox
        error={departmentListQuery.error}
        title={'Department'}
        name="showDepartment"
      />
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
