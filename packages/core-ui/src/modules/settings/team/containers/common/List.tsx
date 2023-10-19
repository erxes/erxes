import React from 'react';
import { useQuery } from '@apollo/client';
import Spinner from '@erxes/ui/src/components/Spinner';
import List from '../../components/common/List';
import { queries } from '@erxes/ui/src/team/graphql';
import { __ } from 'modules/common/utils';
import Box from '@erxes/ui/src/components/Box';
import ErrorMsg from '@erxes/ui/src/components/ErrorMsg';
import { MenuFooter } from 'modules/settings/styles';
import { gql, useMutation } from '@apollo/client';
import { mutations } from '@erxes/ui/src/team/graphql';

type Props = {
  queryParams: string;
  queryType: string;
  title: string;
};

export default function ListContainer(props: Props) {
  const { queryType, title, queryParams } = props;

  const listQuery = useQuery(gql(queries[queryType]), {
    variables: queryType === 'units' ? undefined : { withoutUserFilter: true }
  });

  const [deleteMutation] = useMutation(gql(mutations[queryType + 'Remove']));

  if (listQuery.loading) {
    return <Spinner />;
  }

  if (listQuery.error) {
    return (
      <Box isOpen={true} title={title} name={`show${title}`}>
        <MenuFooter>
          <ErrorMsg>{listQuery.error.message}</ErrorMsg>
        </MenuFooter>
      </Box>
    );
  }

  return (
    <List
      queryType={queryType}
      title={title}
      listQuery={listQuery}
      queryParams={queryParams}
      deleteMutation={deleteMutation}
    />
  );
}
