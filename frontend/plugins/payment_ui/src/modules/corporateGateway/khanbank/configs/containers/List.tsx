import { gql, useMutation, useQuery } from '@apollo/client';
import { useConfirm } from 'erxes-ui';
import List from '../components/List';
import { mutations, queries } from '../graphql';
import { ConfigsListQueryResponse } from '../types';

export default function ListContainer() {
  const { data, loading, refetch } =
    useQuery<ConfigsListQueryResponse>(gql(queries.listQuery), {
      fetchPolicy: 'network-only',
    });
  const { confirm } = useConfirm();
  const [removeMutation] = useMutation(gql(mutations.removeMutation));
 
  const remove = (_id: string) => {
  confirm({
    message: 'Are you sure you want to remove this config?',
  }).then(async () => {
    try {
      await removeMutation({
        variables: { _id },
      });

      await refetch();
    } catch (error) {
      console.error(error);
    }
  });
};

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    );
  }

  const configs = data?.khanbankConfigsList?.list ?? [];

  return (
    <List
      configs={configs}
      loading={loading}
      remove={remove}
      refetch={refetch}
    />
  );
}