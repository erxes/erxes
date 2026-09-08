import { useApolloClient, useMutation } from '@apollo/client';
import { GET_HELP_CENTERS } from '@/helpcenter/graphql/queries/getHelpCenters';
import { REMOVE_TOPIC } from '@/knowledgebase/graphql/mutations';

export const useRemoveHelpCenters = () => {
  const client = useApolloClient();
  const [removeTopic, { loading }] = useMutation(REMOVE_TOPIC);

  const removeHelpCenters = async (ids: string[]) => {
    await Promise.all(
      ids.map((_id) =>
        removeTopic({
          variables: { _id },
          update: (cache) => {
            cache.evict({
              id: cache.identify({ __typename: 'KnowledgeBaseTopic', _id }),
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
