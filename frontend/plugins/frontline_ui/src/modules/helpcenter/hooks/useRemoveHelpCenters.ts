import { useApolloClient, useMutation } from '@apollo/client';
import { HELP_CENTER_CONFIG_REMOVE } from '@/helpcenter/graphql/mutations/helpCenterConfigUpdate';
import { GET_HELP_CENTERS } from '@/helpcenter/graphql/queries/getHelpCenters';

export const useRemoveHelpCenters = () => {
  const client = useApolloClient();
  const [removeConfig, { loading }] = useMutation(HELP_CENTER_CONFIG_REMOVE);

  const removeHelpCenters = async (ids: string[]) => {
    await Promise.all(
      ids.map((_id) =>
        removeConfig({
          variables: { _id },
          update: (cache) => {
            cache.evict({
              id: cache.identify({ __typename: 'HelpCenterConfig', _id }),
            });
            cache.gc();
          },
        }),
      ),
    );

    await client.refetchQueries({ include: [GET_HELP_CENTERS] });
  };

  return { removeHelpCenters, loading };
};
