import { gql, useMutation, useQuery } from '@apollo/client';
import { useConfirm } from 'erxes-ui';
import { toast } from 'erxes-ui/hooks/use-toast';

import List from '../components/List';
import { mutations, queries } from '../graphql';
import { ConfigsListQueryResponse } from '../types';

export function ListContainer() {
  const { confirm } = useConfirm();

  const { data, loading, error, refetch } = useQuery<ConfigsListQueryResponse>(
    gql(queries.listQuery),
    {
      fetchPolicy: 'network-only',
    },
  );

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

        toast({
          variant: 'success',
          title: 'Config removed',
          description: 'You successfully removed the config.',
        });
      } catch (e) {
        console.error(e);

        toast({
          variant: 'destructive',
          title: 'Something went wrong',
          description: e.message,
        });
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

  if (error) {
    return (
      <div className="flex justify-center py-10">
        <span className="text-sm text-destructive">
          Failed to load configurations.
        </span>
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
