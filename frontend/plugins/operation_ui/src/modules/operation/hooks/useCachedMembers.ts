import { useApolloClient } from '@apollo/client';
import { useAtomValue } from 'jotai';
import { useState } from 'react';
import { currentUserState, IUser } from 'ui-modules';
import { gql } from '~/gql';

const CACHED_MEMBER_FIELDS = gql(`
  fragment OperationCachedMemberFields on User {
    _id
    username
    isActive
    details {
      avatar
      fullName
    }
  }
`);

// Virtualized table rows remount while scrolling. Seeding a member select with
// the users already in the Apollo cache lets their avatars render on the first
// frame instead of blinking through the empty state on every remount.
export const useCachedMembers = (
  memberIds?: string | string[] | null,
): IUser[] => {
  const client = useApolloClient();
  const currentUser = useAtomValue(currentUserState);

  const [members] = useState<IUser[]>(() => {
    const ids = !memberIds
      ? []
      : Array.isArray(memberIds)
        ? memberIds
        : [memberIds];

    return ids.flatMap((id): IUser[] => {
      if (!id || id === 'no-assignee') return [];
      if (currentUser?._id === id) return [currentUser];

      const cached = client.readFragment({
        id: client.cache.identify({ __typename: 'User', _id: id }),
        fragment: CACHED_MEMBER_FIELDS,
      });

      if (!cached?._id) return [];

      return [
        {
          _id: cached._id,
          username: cached.username ?? undefined,
          isActive: cached.isActive ?? undefined,
          isOnboarded: true,
          details: {
            avatar: cached.details?.avatar ?? undefined,
            fullName: cached.details?.fullName ?? undefined,
          },
        },
      ];
    });
  });

  return members;
};
