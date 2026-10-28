import { useApolloClient } from '@apollo/client';
import { useCallback } from 'react';
import { STRUCTURE_ACCESS_MEMBERS } from '@/structure-access/graphql/structureAccessQueries';
import { IStructureAccessMember } from '@/structure-access';

const MEMBERS_QUERY = 'StructureAccessMembers';

export const useStructureMembershipSync = () => {
  const client = useApolloClient();

  return useCallback(
    async (entityIds: string[]) => {
      const ids = [...new Set(entityIds)];

      await Promise.all(
        ids.map(async (entityId) => {
          const { data } = await client.query<{
            structureEntityMembers: IStructureAccessMember[];
          }>({
            query: STRUCTURE_ACCESS_MEMBERS,
            variables: { entityId, includeEnded: false },
            fetchPolicy: 'network-only',
          });

          client.cache.modify({
            id: client.cache.identify({
              __typename: 'StructureEntity',
              _id: entityId,
            }),
            fields: {
              memberCount: () => data.structureEntityMembers.length,
            },
          });
        }),
      );

      await client.refetchQueries({
        include: 'active',
        onQueryUpdated: (query) =>
          query.queryName === MEMBERS_QUERY &&
          query.variables?.includeEnded === true &&
          ids.includes(query.variables.entityId),
      });
    },
    [client],
  );
};
