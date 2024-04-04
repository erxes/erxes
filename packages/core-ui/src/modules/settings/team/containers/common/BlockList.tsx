import { Alert, __, confirm } from 'modules/common/utils';
import { gql, useMutation } from '@apollo/client';

import BlockList from '../../components/common/BlockList';
import Box from '@erxes/ui/src/components/Box';
import ErrorMsg from '@erxes/ui/src/components/ErrorMsg';
import { MenuFooter } from 'modules/settings/styles';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import { mutations } from '@erxes/ui/src/team/graphql';
import { queries } from '@erxes/ui/src/team/graphql';
import { useQuery } from '@apollo/client';

type Props = {
  queryParams: string;
  queryType: string;
  title: string;
};

export default function BlockListContainer(props: Props) {
  const { queryType, title, queryParams } = props;

  const listQuery = useQuery(gql(queries[queryType]), {
    variables: queryType === 'units' ? undefined : { withoutUserFilter: true }
  });

  const [deleteMutation] = useMutation(gql(mutations[queryType + 'Remove']));

  const removeItem = (_id: string) => {
    confirm().then(() => {
      deleteMutation({ variables: { ids: [_id] } })
        .then(() => {
          listQuery.refetch();

          Alert.success('Successfully deleted');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    });
  };

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

  const allItems = listQuery.data[queryType] || [];

  return (
    <BlockList
      queryType={queryType}
      allDatas={allItems}
      title={title}
      listQuery={listQuery}
      queryParams={queryParams}
      removeItem={removeItem}
    />
  );
}
