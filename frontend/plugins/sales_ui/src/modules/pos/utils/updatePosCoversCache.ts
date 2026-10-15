import {
  isReference,
  type ApolloCache,
  type Reference,
  type StoreObject,
} from '@apollo/client';

export const updateCacheAfterRemove = (
  cache: ApolloCache<unknown>,
  posCoverIds: string[],
) => {
  cache.modify({
    fields: {
      posCovers(
        existing:
          | readonly (Reference | StoreObject)[]
          | Reference
          | null
          | undefined,
        { readField },
      ) {
        if (existing === null || isReference(existing)) return existing;
        return (existing ?? []).filter(
          (cover) =>
            !posCoverIds.includes(readField<string>('_id', cover) ?? ''),
        );
      },
    },
  });
};
